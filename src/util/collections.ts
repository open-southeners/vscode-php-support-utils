import type { Primitive } from 'type-fest';

declare type MaybeReadonly<T> = Readonly<T> | T;

export function findFirst<T = Record<string, unknown>>(from: Array<T>, predicate: Partial<Record<keyof T, MaybeReadonly<Primitive | Array<Primitive>>>>) {
  let matched: T | undefined;

  from.every(item => {
    const firstPredicateKey = Object.keys(predicate)[0];
    const firstPredicateValue = Object.values<MaybeReadonly<Primitive | Array<Primitive>>>(predicate)[0];

    // @ts-expect-error
    if (([] as Array<string>).concat(firstPredicateValue as string).indexOf(item[firstPredicateKey]) !== -1) {
      matched = item;

      return false;
    }

    return true;
  });

  return matched;
}