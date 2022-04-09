export { findFirst } from './collections';

export { getNamespace, guessBaseNamespace } from './namespaces';

export { parseCode, createObjectFile, getComposerProjectFile } from './php';
export type { PhpObjectType, ComposerJsonFileAutoload, ComposerJsonFile } from './php';

export { getActiveFolder, getExplorerFocusedFolder, getFolderFromFileUri, workspaceIsWritable } from './filesystem';

export { capitalize, lowercase, getDocumentIndentationAsString } from './misc';