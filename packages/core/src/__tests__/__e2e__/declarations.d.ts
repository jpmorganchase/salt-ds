declare module "*.png" {
  // biome-ignore lint/suspicious/noExplicitAny: any is simpler here
  const content: any;
  export default content;
}
