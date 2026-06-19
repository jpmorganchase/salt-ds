export const stripMarkdownLinks = (text: string): string =>
  text.replace(/\[([^[\]]*)\]\((.*?)\)/gm, "$1");
