export type PlainObject = { [name: string]: any };

export const isPlainObject = (obj: any): obj is PlainObject =>
  Object.prototype.toString.call(obj) === "[object Object]";
