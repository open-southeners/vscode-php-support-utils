import path from 'path';
import { commands, env, ExtensionContext, OutputChannel, SnippetString, Uri, window, workspace } from 'vscode';
import { EXT_OUTPUT_CHANNEL_NAME } from './constants';
import { createObjectFile, getActiveFolder, getNamespace, workspaceIsWritable } from './util';
import { stat } from 'fs/promises';

let outputChannel: OutputChannel | null;

export function activate(context: ExtensionContext) {
  outputChannel = window.createOutputChannel(EXT_OUTPUT_CHANNEL_NAME);

  context.subscriptions.push(
    commands.registerCommand('php-support-utils.newFile', async (folder: Uri) => {
      const contextUri = await getActiveFolder(folder);

      if (!contextUri || !workspaceIsWritable(contextUri)) {
        return await window.showErrorMessage('Current workspace folder is not writable. Please try with a different one.');
      }

      const fileName = await window.showInputBox({
        title: 'Create new PHP file',
        placeHolder: 'File name',
        validateInput: async (value: string) => {
          if (value === '') {
            return 'File name must have some characters';
          }

          if (value.endsWith('.php')) {
            return 'File already has a .php extension, please remove it';
          }

          try {
            await stat(path.posix.resolve(contextUri.path, `${value}.php`));
    
            return 'File with the same name already exists';
          } catch (e) {
            return;
          }
        },
      });

      if (!fileName) {
        return;
      }

      const newFileInWorkspacePath = folder.with({ path: path.posix.join(folder.path, `${fileName}.php`) });

      await workspace.fs.writeFile(newFileInWorkspacePath, Buffer.from('', 'utf-8'));

      const document = await window.showTextDocument(newFileInWorkspacePath);
      
      await document.insertSnippet(
        new SnippetString('<?php\n\n${0}')
      );
    })
  );

  context.subscriptions.push(
    commands.registerCommand('php-support-utils.newObject', () => {
      createObjectFile();
    })
  );

  context.subscriptions.push(
    commands.registerCommand('php-support-utils.newClass', (folder?: Uri) => {
      createObjectFile('class', folder);
    })
  );

  context.subscriptions.push(
    commands.registerCommand('php-support-utils.newTrait', (folder?: Uri) => {
      createObjectFile('trait', folder);
    })
  );
  
  context.subscriptions.push(
    commands.registerCommand('php-support-utils.newInterface', (folder?: Uri) => {
      createObjectFile('interface', folder);
    })
  );

  context.subscriptions.push(
    commands.registerCommand('php-support-utils.newEnum', (folder?: Uri) => {
      createObjectFile('enum', folder);
    })
  );

  context.subscriptions.push(
    commands.registerCommand('php-support-utils.copyNamespace', async (file: Uri) => {
      const document = await workspace.openTextDocument(file);
      
      const text = document.getText();

      const namespace = getNamespace(text);

      if (!namespace) {
        return window.showWarningMessage('Namespace not found in file or format not supported.', 'Ok');
      }

      await env.clipboard.writeText(namespace);

      outputChannel?.appendLine(`FQCN copied as "${namespace}"!`);
    })
  );
}

export function deactivate() {
  if (outputChannel) {
    outputChannel.clear();
    outputChannel.dispose();
  }

  outputChannel = null;
}
