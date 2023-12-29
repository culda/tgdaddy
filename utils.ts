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

export function truncatedText(
  value: string,
  start: number,
  end = start
): string {
  if (value.length < start + end) {
    return value;
  }
  return `${value.slice(0, start)}...${value.slice(-end)}}`;
}

export function isProd(): boolean {
  return process.env.NODE_ENV === 'production';
}
