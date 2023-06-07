This plugin adds "?inline" to each css import within our components to disable vite's own style injection used in storybook.

Vite as of version 4 deprecated the use of default and named imports and instead requires you to append '?inline' to a CSS import to opt out of Vite's style injection
This plugin iterates through all the imports in the component typescript files checks if the file imported is a .css file.
If the extension matches, the plugin appends '?inline' to the CSS file name.
