import { addons } from "storybook/manager-api";
import saltTheme from "./SaltTheme";

addons.setConfig({
  theme: saltTheme,
});
