import { addons, types } from "@storybook/manager-api";
import saltTheme from "./SaltTheme";
import { ComponentBaseToolbar } from "./toolbar/ComponentBaseToolbar";
import { ThemeNextToolbar } from "./toolbar/ThemeNextToolbar";

addons.setConfig({
  theme: saltTheme,
});

addons.register("theme-next-addon", () => {
  addons.add("theme-next-addon/toolbar", {
    title: "Theme next toolbar",
    //👇 Sets the type of UI element in Storybook
    type: types.TOOL,
    render: ThemeNextToolbar,
  });
  addons.add("component-base-addon/toolbar", {
    title: "Component Base toolbar",
    //👇 Sets the type of UI element in Storybook
    type: types.TOOL,
    render: ComponentBaseToolbar,
  });
});
