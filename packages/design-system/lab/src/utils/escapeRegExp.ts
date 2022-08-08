const regExp = /[.*+?^${}()|[\]\\]/g;

export function escapeRegExp(string: string): string {
  return string.replace(regExp, "\\$&");
}
