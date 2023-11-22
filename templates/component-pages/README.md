# How to use the component page MDX template

Follow these steps to add a new component page to the Salt website.

## 1. Getting started

Copy the [`component-name/`](./component-name/) folder into the [`site/docs/components/` directory](../../site/docs/components/) and rename it to your component's name in kebab case. For example `form-field/`.
   - 💡 **Tip:** If you are using GitHub's website to edit component docs, you can press the <kbd>.</kbd> key to launch a version of VS Code in your browser and copy the directory via that. 

Read the Salt content style guide to ensure your writing maintains consistency with other documentation.

## 2. Index.mdx

Fill in the `index.mdx` file's frontmatter.

### Description

Wrap the description in "" quote marks. Introduce the components(s) with one to three sentences describing what the component is, why someone would use it, and what problem it solves. Try to introduce all the components that the document covers using Pascal case and back ticks, i.e. `ToggleButton` and `ToggleButtonGroup`.

### sourceCodeUrl

Provide the URL to the relevant directory that contains the main source code for this component.

### Package name

Provide the name of the NPM package that contains this component, e.g. "@salt-ds/core."

### alsoKnownAs

List synonymous names that someone might use when searching for this component. Use sentence case. List them in alphabetical order.

### relatedComponents

List other, similar components with the relationship "similarTo." List other components that this component uses with the relationship "contains." As with alsoKnownAs, use sentence case and order them alphabetically.

### stickerSheet

Link to a Figma stickersheet where applicable.

## 3. Usage.mdx

### Using the component

Change the header title to "Using the components" where applicable.

If needed, provide general usage and guidance that the reader should know. This could cover how they might use it, what sort of questions they might have, what sort of usage you want to discourage. Link to other resources where relevant.

Keep the guidance here short, no more than five sentences. Leave the section blank if 

## 4. Examples.mdx

## 5. Accessibility.mdx

