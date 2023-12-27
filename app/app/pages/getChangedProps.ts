export async function getChangedProps(base: any, obj: any): Promise<any> {
  const changedProperties: any = {};

  for (const key in obj) {
    if (JSON.stringify(base[key]) !== JSON.stringify(obj[key])) {
      changedProperties[key] = obj[key];
    }
  }

  return changedProperties;
}
