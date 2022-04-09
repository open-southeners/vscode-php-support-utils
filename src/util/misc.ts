import { TextEditor } from "vscode";

export function lowercase(value: string) {
  return value.toLocaleLowerCase()
}

export function capitalize(value: string) {
  const valueToLower = lowercase(value);
  
  return valueToLower.charAt(0).toLocaleUpperCase() + valueToLower.slice(1)
}

export function getDocumentIndentationAsString(document: TextEditor, defaultSize = 1) {
  const { tabSize, insertSpaces } = document.options;
  let sizeNumber = tabSize

  if (typeof tabSize === 'string') {
    sizeNumber = parseInt(tabSize) || defaultSize;
  }

  return (insertSpaces ? ' ' : '\t').repeat(sizeNumber as number)
}

export function removeFilenameFromPath(path: string) {
  return 
}