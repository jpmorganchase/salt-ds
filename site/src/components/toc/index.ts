import { TableOfContents as OriginalTableOfContents } from "./TableOfContents";
import { withTableOfContentsAdapter } from "./withTableOfContentsAdapter";

export type { Item, TableOfContentsProps } from "./TableOfContents";
export { withTableOfContentsAdapter } from "./withTableOfContentsAdapter";

export const TableOfContents = withTableOfContentsAdapter(
  OriginalTableOfContents,
);
