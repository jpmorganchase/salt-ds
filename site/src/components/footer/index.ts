import { withFooterAdapter } from "./withFooterAdapter";
import { Footer as OriginalFooter } from "./Footer";

export const Footer = withFooterAdapter(OriginalFooter);
