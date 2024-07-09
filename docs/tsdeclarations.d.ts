// VS Code doesn't like this because it duplicates a declaration in React, but it's for StoryBook and
// our story type-checking script
declare module "*.svg" {
  // biome-ignore lint/suspicious/noExplicitAny: any is simpler here
  const content: any;
  export default content;
}
