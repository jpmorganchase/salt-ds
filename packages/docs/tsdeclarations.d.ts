// VS Code doesn't like this because it duplicates a declaration in React, but it's for StoryBook and
// our story type-checking script
declare module "*.svg" {
  const content: any;
  export default content;
}
