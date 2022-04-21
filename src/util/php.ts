import { stat, readFile } from "fs/promises";
import template from "lodash.template";
import path from "path";
import { Engine } from "php-parser";
import { SnippetString, Uri, window, workspace } from "vscode";
import { PHP_OBJECT_TYPES } from "../constants";
import { getActiveFolder, workspaceIsWritable } from "./filesystem";
import { capitalize, getDocumentIndentationAsString } from "./misc";
import { guessBaseNamespace } from "./namespaces";

export declare type PhpObjectType = 'class' | 'trait' | 'interface' | 'enum';

const phpParser = new Engine({
  parser: {
    extractDoc: true,
  },
});

export function parseCode(code: string, filename = '') {
  return phpParser.parseCode(code, filename);
}

export async function createObjectFile(type?: PhpObjectType, folder?: Uri) {
  const contextUri = await getActiveFolder(folder);

  if (!contextUri || !workspaceIsWritable(contextUri)) {
    return await window.showErrorMessage('Current workspace folder is not writable. Please try with a different one.');
  }

  const objectType = type || 'object';
  const fileName = await window.showInputBox({
    title: `Create new PHP ${objectType}`,
    placeHolder: `${capitalize(objectType)} name`,
    validateInput: async (value: string) => {
      if (!value.match(/^[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*$/)) {
        return 'Illegal filename. Try removing some symbols from it';
      }

      try {
        await stat(path.posix.resolve(contextUri.path, `${value}.php`));

        return 'File with the same name already exists';
      } catch (e) {
        return;
      }
    }
  });

  if (!fileName) {
    return;
  }

  const newFileInWorkspacePath = contextUri.with({
    path: path.posix.join(contextUri.path, `${fileName}.php`)
  });

  await workspace.fs.writeFile(newFileInWorkspacePath, Buffer.from('', 'utf-8'));

  const document = await window.showTextDocument(newFileInWorkspacePath);

  let namespace = await guessBaseNamespace(newFileInWorkspacePath);

  if (namespace) {
    namespace = `namespace ${namespace};\n\n`;
  }

  const compile = template(
    '<?php\n\n{{ namespace }}{{ type }} {{ name }}\n{\n{{ tabSpace }}${0:// }\n}',
    {
      interpolate: /{{([\s\S]+?)}}/g
    }
  );

  document.insertSnippet(
    new SnippetString(
      compile({
        type: objectType === 'object' ? '${1|' + PHP_OBJECT_TYPES.join(',') + '|}' : objectType,
        namespace: namespace || '',
        name: fileName,
        tabSpace: getDocumentIndentationAsString(document)
      })
    )
  );
}

export interface ComposerJsonFileAutoload {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'psr-4': Record<string, string | Array<string>>
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'psr-0': Record<string, string | Array<string>>
  
  // Rest is irrelevant from the current package features
  // TODO: Remove if unnecesary
  classmap: Array<string>
  files: Array<string>
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'exclude-from-classmap': Array<string>
}

export interface ComposerJsonFile {
  autoload: Partial<ComposerJsonFileAutoload>
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'autoload-dev': Partial<ComposerJsonFileAutoload>
}

export async function getComposerProjectFile(relative: Uri) {
  let composerFilePath = (workspace.getWorkspaceFolder(relative) || workspace.workspaceFolders?.[0])?.uri.path;

  if (!composerFilePath) {
    return false;
  }

  composerFilePath = path.posix.resolve(composerFilePath, 'composer.json');

  let composerFileContent: Partial<ComposerJsonFile>;

  try {
    composerFileContent = JSON.parse(await readFile(composerFilePath, { encoding: 'utf8' }));
  } catch (e) {
    return false;
  }

  return composerFileContent;
}