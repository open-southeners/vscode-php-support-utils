export { findFirst } from './collections';

export { getNamespace, guessBaseNamespace } from './namespaces';

export { parseCode, createObjectFile, getComposerProjectFile } from './php';
export type { PhpObjectType, ComposerJsonFileAutoload, ComposerJsonFile } from './php';

export { capitalize, lowercase, getDocumentIndentationAsString } from './misc';