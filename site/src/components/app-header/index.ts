import { withAppHeaderAdapter } from "./withAppHeaderAdapter";
import { AppHeader as OriginalAppHeader } from "./AppHeader";

export { withAppHeaderAdapter } from "./withAppHeaderAdapter";
export const AppHeader = withAppHeaderAdapter(OriginalAppHeader);
