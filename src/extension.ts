import path from 'path';
import * as vscode from 'vscode';
import type { Declaration, Namespace } from 'php-parser';
import { Engine } from 'php-parser';
import template from 'lodash.template';

declare type PhpObjectType = 'class' | 'trait' | 'interface' | 'enum'

export function activate(context: vscode.ExtensionContext) {
  const outputChannel = vscode.window.createOutputChannel("PHP Support Utils");
  const phpParser = new Engine({
    parser: {
      extractDoc: true,
    },
  })
  
  outputChannel.show();

  function findFirst<T = Record<string, any>>(from: Array<T>, predicate: Partial<Record<keyof T, string | Array<string>>>) {
    let matched: T | undefined

    from.every(item => {
      const firstPredicateKey = Object.keys(predicate)[0]
      const firstPredicateValue = Object.values<string | Array<string>>(predicate)[0]

      console.log(firstPredicateValue, ' indexOf: ', item[firstPredicateKey])

      if ([].concat(firstPredicateValue).indexOf(item[firstPredicateKey]) !== -1) {
        matched = item

        return false
      }

      return true
    })

    return matched
  }

  const getNamespace = (code: string) => {
    const parsedCode = phpParser.parseCode(code, '')

    const namespace = findFirst(parsedCode.children, { kind: 'namespace' }) as Namespace | undefined

    if (!namespace || !('children' in namespace)) {
      return false;
    }

    const mainDeclaration = findFirst(namespace.children, {
      kind: ['class', 'enum', 'trait', 'interface']
    }) as Declaration | undefined

    if (!mainDeclaration || !('name' in mainDeclaration) || !namespace || !('name' in namespace)) {
      return false;
    }

    return namespace.name + '\\' + (typeof mainDeclaration.name === 'object' ? mainDeclaration.name.name : mainDeclaration.name)
  }

  const guessBaseNamespace = (file: vscode.Uri) => {
    let relativePathFragments = vscode.workspace.asRelativePath(file).split(path.sep)

    relativePathFragments.pop()

    return relativePathFragments.map(fragment =>
      // TODO: Do we really need this capitalize?
      fragment.trim().toLowerCase().replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())))
    ).join('\\')
  }

  const createPhpObject = async (type: PhpObjectType, folder: vscode.Uri) => {
    const fileName = await vscode.window.showInputBox({
      title: `Create new PHP ${type}`,
      placeHolder: `${type} name`
    })

    const newFileInWorkspacePath = folder.with({ path: path.posix.join(folder.path, `${fileName}.php`) })

    await vscode.workspace.fs.writeFile(newFileInWorkspacePath, Buffer.from('', 'utf-8'))

    await vscode.window.showTextDocument(newFileInWorkspacePath)

    const compile = template(require('./stubs/php_namespaced_object.txt'), {
      interpolate: /{{([\s\S]+?)}}/g
    })

    await vscode.window.activeTextEditor?.insertSnippet(
      new vscode.SnippetString(
        compile({
          type,
          namespace: guessBaseNamespace(newFileInWorkspacePath),
          name: fileName
        })
      )
    )
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('php-support-utils.newFile', async (folder: vscode.Uri) => {
      const fileName = await vscode.window.showInputBox({
        title: 'Create new PHP file',
        placeHolder: 'File name'
      })

      const newFileInWorkspacePath = folder.with({ path: path.posix.join(folder.path, `${fileName}.php`) })

      await vscode.workspace.fs.writeFile(newFileInWorkspacePath, Buffer.from('', 'utf-8'))

      await vscode.window.showTextDocument(newFileInWorkspacePath)
      
      await vscode.window.activeTextEditor?.insertSnippet(
        new vscode.SnippetString('<?php\n\n${1}')
      )
    })
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('php-support-utils.newClass', (folder: vscode.Uri) => {
      createPhpObject('class', folder)
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('php-support-utils.newTrait', (folder: vscode.Uri) => {
      createPhpObject('trait', folder)
    })
  )
  
  context.subscriptions.push(
    vscode.commands.registerCommand('php-support-utils.newInterface', (folder: vscode.Uri) => {
      createPhpObject('interface', folder)
    })
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('php-support-utils.newEnum', (folder: vscode.Uri) => {
      createPhpObject('enum', folder)
    })
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('php-support-utils.copyNamespace', async (file: vscode.Uri) => {
      
      const document = await vscode.workspace.openTextDocument(file);
      
      const text = document.getText();

      const namespace = getNamespace(text)

      if (!namespace) {
        return vscode.window.showWarningMessage('Namespace not found in file or format not supported.', 'Ok');
      }

      await vscode.env.clipboard.writeText(namespace);

      outputChannel.appendLine(`FQCN copied as "${namespace}"!`);
    })
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
