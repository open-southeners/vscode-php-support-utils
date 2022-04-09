import path from "path";
import type { Declaration, Namespace } from "php-parser";
import { Uri, workspace } from "vscode";
import { PHP_OBJECT_TYPES, PHP_VIRTUAL_SEPARATOR } from "../constants";
import { findFirst } from "./collections";
import { getComposerProjectFile, parseCode } from "./php";

export function namespaceJoin(...parts: Array<string>) {
  return parts.map(part => {
    if (part.endsWith('\\')) {
      return part.replace(/\\$/, '')
    }

    return part
  }).filter(Boolean).join(PHP_VIRTUAL_SEPARATOR);
}

export function getNamespace(code: string) {
  const parsedCode = parseCode(code);

  const namespace = findFirst(parsedCode.children, {
    kind: 'namespace'
  }) as Namespace | undefined;

  if (!namespace || !('children' in namespace)) {
    return false;
  }

  const mainDeclaration = findFirst(namespace.children, {
    kind: PHP_OBJECT_TYPES
  }) as Declaration | undefined;

  if (!mainDeclaration || !('name' in mainDeclaration) || !namespace || !('name' in namespace)) {
    return false;
  }

  return namespaceJoin(
    namespace.name,
    typeof mainDeclaration.name === 'object' ? mainDeclaration.name.name : mainDeclaration.name
  );
}

// TODO: Remove and create file without namespace if composer not present
function fallbackGuessBaseNamespace(file: Uri) {
  let relativePathFragments = workspace.asRelativePath(file).split(path.sep);

  relativePathFragments.pop();

  return relativePathFragments.map(fragment =>
    // TODO: Do we really need this capitalize?
    fragment.trim().toLowerCase().replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())))
  ).join('\\');
}

export async function guessBaseNamespace(file: Uri) {
  const composerFile = await getComposerProjectFile(file);
  
  if (!composerFile) {
    return fallbackGuessBaseNamespace(file);
  }
  
  const mergedAutoload = Object.fromEntries([
    ...Object.entries(composerFile.autoload?.["psr-4"] || []),
    ...Object.entries(composerFile.autoload?.["psr-0"] || []),
    ...Object.entries(composerFile["autoload-dev"]?.["psr-4"] || []),
    ...Object.entries(composerFile["autoload-dev"]?.["psr-0"] || [])
  ]);
  
  const relativePathFromWorkspace = workspace.asRelativePath(file);
  let matchedFromAutoload: string|false = false;

  for (const [key, value] of Object.entries(mergedAutoload)) {
    if (typeof value === 'object' && value.filter(item => relativePathFromWorkspace.startsWith(item)).length > 0) {
      matchedFromAutoload = key;
    }

    if (typeof value === 'string' && relativePathFromWorkspace.startsWith(value)) {
      matchedFromAutoload = key;
      break;
    }
  }
  
  if (!matchedFromAutoload) {
    return false;
  }
  
  const unmappedNamespacePart = path.dirname(
    relativePathFromWorkspace.replace(
      new RegExp(`^${mergedAutoload[matchedFromAutoload]}`),
      ''
    )
  );

  if (unmappedNamespacePart && !unmappedNamespacePart.includes('.') && unmappedNamespacePart.length > 0) {
    return namespaceJoin(matchedFromAutoload, unmappedNamespacePart)
  }

  return matchedFromAutoload.replace(/\\$/, '');
}