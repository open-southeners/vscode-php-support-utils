import path from 'path';
import { commands, env, ExtensionContext, SnippetString, Uri, window, workspace } from 'vscode';
import { EXT_OUTPUT_CHANNEL_NAME } from './constants';
import { createObjectFile, getNamespace } from './util';

export function activate(context: ExtensionContext) {
  const outputChannel = window.createOutputChannel(EXT_OUTPUT_CHANNEL_NAME);

  context.subscriptions.push(
    commands.registerCommand('php-support-utils.newFile', async (folder: Uri) => {
      const fileName = await window.showInputBox({
        title: 'Create new PHP file',
        placeHolder: 'File name'
      });

      const newFileInWorkspacePath = folder.with({ path: path.posix.join(folder.path, `${fileName}.php`) });

      await workspace.fs.writeFile(newFileInWorkspacePath, Buffer.from('', 'utf-8'));

      const document = await window.showTextDocument(newFileInWorkspacePath);
      
      await document.insertSnippet(
        new SnippetString('<?php\n\n${0}')
      );
    })
  );

  context.subscriptions.push(
    commands.registerCommand('php-support-utils.newClass', (folder: Uri) => {
      createObjectFile('class', folder);
    })
  );

  context.subscriptions.push(
    commands.registerCommand('php-support-utils.newTrait', (folder: Uri) => {
      createObjectFile('trait', folder);
    })
  );
  
  context.subscriptions.push(
    commands.registerCommand('php-support-utils.newInterface', (folder: Uri) => {
      createObjectFile('interface', folder);
    })
  );

  context.subscriptions.push(
    commands.registerCommand('php-support-utils.newEnum', (folder: Uri) => {
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

      outputChannel.appendLine(`FQCN copied as "${namespace}"!`);
    })
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
