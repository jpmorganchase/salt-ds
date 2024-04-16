import { withAnchorHeading } from "./anchorHeading";
import { Code as code } from "./code";
import { Heading2 } from "./h2";
import { Heading3 } from "./h3";
import { Heading4 } from "./h4";
import { Paragraph as p } from "./p";
import { Pre as pre } from "./pre";
import { Table as table } from "./table";
import { Thead as thead } from "./thead";
import { Tr as tr } from "./tr";
import { UnorderedList as ul } from "./ul";
import { Link as a } from "./link";

const h2 = withAnchorHeading(Heading2);
const h3 = withAnchorHeading(Heading3);
const h4 = withAnchorHeading(Heading4);

export { a, code, h2, h3, h4, p, pre, table, thead, tr, ul }; // replace default MDX components
