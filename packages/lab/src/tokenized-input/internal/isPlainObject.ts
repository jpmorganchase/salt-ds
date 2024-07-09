// biome-ignore lint/suspicious/noExplicitAny: this is a valid use case for `any`
export type PlainObject = { [name: string]: any };

// biome-ignore lint/suspicious/noExplicitAny: this is a valid use case for `any`
export const isPlainObject = (obj: any): obj is PlainObject =>
  Object.prototype.toString.call(obj) === "[object Object]";
