export function isEmptyArray<T extends [] | undefined>(
  value: unknown
): value is T {
  return Array.isArray(value) && value.length === 0;
}

export function isFalseyOrEmptyArray<T extends [] | undefined>(
  value: unknown
): value is T {
  return !value || isEmptyArray(value);
}

export function isArrayOfLength(value: unknown, len: number): boolean {
  return Array.isArray(value) && value.length === len;
}
