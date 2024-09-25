declare module "*.css" {
  const content: string;
  export default content;
}

declare module "*?inline" {
  const src: string;
  export default src;
}

declare module "*?raw" {
  const src: string;
  export default src;
}
