import { Table as table, THead as thead, TR as tr } from "@salt-ds/core";
import { withAnchorHeading } from "./anchorHeading";
import { Code as code } from "./code";
import { Heading2 } from "./h2";
import { Heading3 } from "./h3";
import { Heading4 } from "./h4";
import { Image } from "./image";
import { Link as a } from "./link";
import { Paragraph as p } from "./p";
import { Pre as pre } from "./pre";
import { UnorderedList as ul } from "./ul";

const h2 = withAnchorHeading(Heading2);
const h3 = withAnchorHeading(Heading3);
const h4 = withAnchorHeading(Heading4);

export {
  a,
  code,
  h2,
  h3,
  h4,
  p,
  pre,
  table,
  thead,
  tr,
  ul,
  Image as img,
  Image,
}; // replace default MDX components
