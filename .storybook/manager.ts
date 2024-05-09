import { addons, types } from "@storybook/manager-api";
import saltTheme from "./SaltTheme";
import { ThemeNextToolbar } from "./toolbar/ThemeNextToolbar";

addons.setConfig({
  theme: saltTheme,
});

addons.register("theme-next-addon", () => {
  addons.add("theme-next-addon/toolbar", {
    title: "Theme next toolbar",
    //👇 Sets the type of UI element in Storybook
    type: types.TOOL,
    //👇 Shows the Toolbar UI element if either the Canvas or Docs tab is active
    match: ({ viewMode }) => !!(viewMode && viewMode.match(/^(story|docs)$/)),
    render: ThemeNextToolbar,
  });
});
