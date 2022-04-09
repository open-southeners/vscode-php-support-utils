import path from "path"
import { commands, env, workspace, Uri } from "vscode"

export function getFolderFromFileUri(uri: Uri) {
  return uri.with({ path: path.parse(uri.path).dir })
}

export async function getExplorerFocusedFolder() {
  await commands.executeCommand('copyFilePath');

  return Uri.file(await env.clipboard.readText());
}

export function isFile(value: string) {
  return !!path.extname(value);
}

export async function getActiveFolder(uri?: Uri) {
  if (uri && !isFile(uri.path)) {
    return uri;
  }

  const explorerActiveFolder = await getExplorerFocusedFolder()

  if (explorerActiveFolder && !isFile(explorerActiveFolder.path)) {
    return explorerActiveFolder;
  }

  return workspace.workspaceFolders?.[0].uri;
}

export async function workspaceIsWritable(uri?: Uri) {
  const currentUri = await getActiveFolder(uri);

  if (!currentUri) {
    return false;
  }

  return workspace.fs.isWritableFileSystem(currentUri.scheme) || false;
}