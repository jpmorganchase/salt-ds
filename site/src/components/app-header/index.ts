import { withAppHeaderAdapter } from "@jpmorganchase/mosaic-site-components";
import { AppHeader as OriginalAppHeader } from "./AppHeader";

export const AppHeader = withAppHeaderAdapter(OriginalAppHeader);
