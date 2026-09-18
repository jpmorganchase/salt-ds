declare module "*.css" {
  const content: string;
  export default content;
}
declare module "*.module.css" {
  const content: Record<string, string>;
  export default content;
}
declare module "*.svg" {
  const content: string;
  export default content;
}
declare module "*.png" {
  const content: string;
  export default content;
}
declare module "*?raw" {
  const content: string;
  export default content;
}

declare module "moment/dist/locale/*";
declare module "moment/locale/*";
