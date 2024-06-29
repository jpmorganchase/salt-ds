import { Footer as OriginalFooter } from "./Footer";
import { withFooterAdapter } from "./withFooterAdapter";

export const Footer = withFooterAdapter(OriginalFooter);
