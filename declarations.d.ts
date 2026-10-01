// Declare CSS modules before plain CSS: TypeScript uses the first matching
// wildcard declaration when the patterns have the same prefix.
declare module "*.module.css" {
  const classes: Record<string, string>;
  export default classes;
}

declare module "*.css" {
  const content: string;
  export default content;
}

declare module "*?inline" {
  const src: string;
  export default src;
}

declare module "*.scss" {
  const content: Record<string, string>;
  export default content;
}

declare module "@fontsource/*";
declare module "@fontsource-variable/*";
declare module "moment/dist/locale/*";
declare module "moment/locale/*";
