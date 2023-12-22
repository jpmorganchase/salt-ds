# How to use the component page MDX template

Follow these steps to add a new component page to the Salt website.

## 1. Getting started

Copy the [`component-name/`](./component-name/) folder into the [`site/docs/components/` directory](../../site/docs/components/) and rename it to your component's name in kebab case. For example `form-field/`.

- 💡 **Tip:** If you are using GitHub's website to edit component docs, you can press the <kbd>.</kbd> key to launch a version of VS Code in your browser and copy the directory via that.

Read the [Salt content style guide](../../content-style-guide.md) to ensure your writing maintains consistency with other documentation.

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

Keep the guidance here short, no more than five sentences. Leave the section blank (but keep the header for navigation consistency) if general usage tips are already covered by the introduction and when to use sections.

### When to use/when not to use

These are H4 headers that sit underneath the "using the component" header and text (if present).

Use this section to outline situations where a user may want to use a given component. Be as thorough as possible, and try to cover all scenarios. Try to ensure each "when to use" has an accompanying "when not to use" and vice versa.

Use bullet points, unless there is one point in **both** sections. Use a new bullet point for each new point for clarity.

Don't worry about writing "use" and "don't use" at the start of each sentence, as it's implied by the section header. Try to start the sentence with "when" or "to", such as "when the nav item contains more than four items."

For the "when not to use" section, provide an alternative solution for each point where possible. Format as "Instead, use X" or "Instead, use X to Y" where X is a component or alternative solution and Y is a task or outcome. Use back ticks and Pascal case for component names, and link to the relevant documentation.

### Import

Introduce with the text "To import `[ComponentName]` from the [core/lab/other] Salt package, use:"

- When there are two components: "To import `[Component1]` and `[Component2]` from the [core/lab/other] Salt package, use:"
- When there are three or more components: "To import `[Component1]` and related components from the [core/lab/other] Salt package, use:"

Format import commands with "\```js".

### Props

Props tables are automatically generated using the `PropsTable` component.

```js
<PropsTable packageName="core" componentName="ComponentName" />
```

If there are two or more components, use an H4 header with the name of the component above each props table. Use back ticks and Pascal case for the header. Use the name of the component as it appears in code.

### Content

Provide content-related guidance if applicable. This could include label text for a button component, or list item length for a dropdown. Remove the section if it's blank.

### References

Include any third-party links that may be relevant here, such as W3C guidance. Use bullet points, unless there is only one.

## 4. Examples.mdx

Follow the structure as outlined in the template for examples. Each example needs a corresponding live preview.

Write header titles in sentence case as always.

Example text should describe what is being demonstrated, what it shows about how the component functions, and why it's significant. Why is it different to other examples? Aim for fewer than six sentences, and avoid bullet points.

Where relevant, include a "best practices" H4 section for the given example. While the main example section covers what the component does, this section covers how the component should be used. What sort of usage would you like the encourage or discourage?

Use bullet points for each tip. Don't use any bullet points if there is only one tip.

## 5. Accessibility.mdx

Under the best practices header, write general accessibility tips that the user should know. Refer to third-party sources and guidance where applicable.

Add keyboard interactions underneath the relevant template header. Use the component structure as outlined in the template to produce a table of key combinations. See [the style guide](../../content-style-guide.md) for detailed information on how to refer to given keys.

Use bullet points unless there is only one point in every row. If the combination refers to a single key, use the name of the key in the explanation. If it's a combination or there are multiple possible keys, refer to the combination with "this action."

Place modifier keys, such as Shift, before other keys in a combination.

Use + to separate keys within a combination. Add a space to either side of +.

Use / to separate alternative keys or key combinations. Add a space to either side of /.
