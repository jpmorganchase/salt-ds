# How to use the pattern page MDX templates

Patterns are guides that help teams build design solutions for their project. The goal of the guide is to give teams the information that they can use to build a design solution.

This document outlines how to structure a pattern to best meet this goal. The structure is designed to be as flexible as possible to cover the wide variety of patterns.

Follow these steps to add a pattern with Guidance and Examples pages to the Salt website. Patterns without runnable examples can use a guidance page on its own.

## 1. Getting started

Copy the [`pattern-name/` directory](./pattern-name/) into [`site/docs/patterns/`](../../site/docs/patterns/) and rename it to your pattern's name in kebab case, for example `button-bar/`.

| File                                             | Purpose                                                                               |
| ------------------------------------------------ | ------------------------------------------------------------------------------------- |
| `site/docs/patterns/<pattern-name>/index.mdx`    | Guidance: when to use the pattern, how to build it, and its behaviors and variations. |
| `site/docs/patterns/<pattern-name>/examples.mdx` | Runnable examples, grouped under descriptive headings.                                |

Update both pages' titles, descriptions and `data.patternUrl` to match the new pattern. Set `data.patternUrl` to the guidance URL, such as `/salt/patterns/button-bar`, in **both** files; the layout uses it to connect the Guidance and Examples tabs. Keep `tags: [pattern]` on the guidance page so it appears in the patterns overview. Keep `sidebar.exclude: true` and `data.showThemeControl: true` on the Examples page so the sidebar lists the pattern once and the previews have theme controls.

Replace the placeholder components, related patterns, resource links and image paths with the pattern's actual content, or remove optional entries. Add `aliases` only when preserving a previous URL; the guidance page's current URL does not need an alias.

For a guidance-only pattern, delete `examples.mdx`, remove `data.patternUrl` from `index.mdx`, and remove links to the deleted Examples page. Removing both the page and the tab metadata avoids an Examples tab that leads to a missing route. Keep the `pattern` tag and the guidance page's `DetailPattern` layout.

- 💡 **Tip:** If you are using GitHub's website to edit pattern docs, you can press the <kbd>.</kbd> key to launch a version of VS Code in your browser and copy the directory via that.

Read the [Salt content style guide](../../content-style-guide.md) to ensure your writing maintains consistency with other documentation.

## 2. Filling in

### Style notes

Refer to the Salt content style guide: https://github.com/jpmorganchase/salt-ds/blob/main/content-style-guide.md

Further notes:

- Refer to the name of the pattern in sentence case, e.g., “button bar” not “Button Bar.” Use a/the articles. No need to mention in the introduction that it’s a pattern (e.g. “Button bar is a pattern that...”)---the user is on the pattern page section already.
- Patterns should avoid big blocks of text. Use bullet points and lists where possible, break up with visuals and images.
- Ensure where possible that information displayed in images has accompanying text outlining the information elsewhere. This helps with accessibility.
- Avoid repeating information where possible to ensure simplicity and clarity.
- Use images to illustrate points where possible.
- Use `GuidanceCallout` with `type="positive"` and `customPillText="Best practices"` to highlight key best practices where relevant. If there is one point don’t use bullet points, but if there is more than one use bullet points. Keep points no longer than three sentences. Avoid placing more than three bullet points in a single callout. Leave a blank line before and after a Markdown list inside the callout, and put each list item on its own line.
- Make sure headers are descriptive and unique. Keep headers as short as possible---one to three words, ideally no more than five words.
- Avoid using too many H2 and H3 headers overall as it makes navigation harder. Consider whether you can consolidate headers or use an H4 instead—but never skip header levels.
- Aim to keep paragraphs short and to-the-point.

#### Captions

- Use captions as much as possible, except for the hero, anatomy and layout images.
- Aim for one or two complete sentences that add to the image above.
- They are not necessarily the same as alt text, which describe the image for screen readers. Captions, for example, can reference elements of the image and add to it by providing further explanation.
- A good example of alt text: “A selectable card with a radio button.”
- A good example of a caption: “A selectable card with a radio button to the left, communicating to the user how the card functions.”

Note that for an image switcher, the caption is implemented like this:

```
<ImageSwitcher
  images={[
    {
      src: "/img/patterns/selectable-card/cards-grid-layout.png",
      alt: "Cards arranged in a grid layout",
    },
    {
      src: "/img/patterns/selectable-card/cards-grid-layout-spacing.png",
      alt: "Cards arranged in a grid layout with spacing",
    },
  ]}
  label="Show spacing"
  caption="Cards arranged in a grid layout."
/>
```

### Sidebar

By default, the sidebar shows an “on this page” section that lists all section headers.

Configure the guidance page's frontmatter to populate these sections:

**Components**: `data.components` lists the most relevant components used in the pattern by their documentation titles.

**Patterns**: `data.relatedPatterns` lists other related patterns by their documentation titles.

**Resources**: `data.resources` lists Storybook, Figma and other resources where needed. Mark internal-only links with `internal: true`.

When adding Figma links in the sidebar consider the below recommendations:

- Pattern templates link to the Patterns Templates library. If a pattern doesn't have a template, remove the link.
- Pattern stickers link to the Light component library by default. If a pattern doesn't have a sticker, remove the link.
- If a pattern has both templates and stickers, include both links.

## Guidance page structure

### Introduction

Write the introduction in the guidance page's `description` frontmatter. The page heading displays it, so do not repeat it in the body or add a separate introduction header.

Describe what the design solution sets out to achieve. What is the end result? In broad terms, what does it look like? What is its function? What problem does it solve?

Aim for around 50 words, or three to four sentences. Avoid more than 100 words: it’s likely that some information could move to another section.

No need to list components here—we already listed them in the sidebar.

### When to use

H2 header: When to use

Explain the situation in which a team would likely use the pattern. Describe the use case clearly. Make sure you use enough detail that a team would understand whether it’s useful for them.

This section has the same name as the component documentation, but the style is not the same.

Use bullet points if you are describing more than one use case. Ensure bullet points don’t run longer than three sentences, ideally shorter.

### How to build

H2 header: How to build

#### Anatomy

H3 header: Anatomy

List out key visible features of the pattern in a numbered list. Use bold type to name each item, then add a colon, then describe the item in no more than two sentences.

The items don’t have to be components, but it is preferable to reference components when possible. This makes it clearer how to use the components to construct the pattern. Use backticks and pascal case when referencing the component in the numbered list.

Provide an accompanying annotated image that uses numbered arrows to correspond to each part of the numbered list.

#### Layout

H3 header: Layout (if you have multiple layouts, change each H3 to a suitable title such as “desktop layout”)

Use step-by-step instructions with a bullet point list to explain how to lay out the anatomy described above. Use no more than three sentences for each point.

Provide an annotated image that shows spacing tokens and components used to achieve the layout. Use sentence case to refer to the component.

#### Color

H3 header: Color

Only use this section if your pattern contains several color tokens that you need to clarify to the user. If needed, use this section to capture the tokens that the user should use. Provide an annotated image that points to the tokens used.

### Variants

H2 header: name of the variant

Use this to outline alternatives and variants to the basic pattern described above. A variant could include an app header with vertical navigation.

Ensure variants are as comprehensive as possible to avoid using too many headers. Use H3 headers if needed to describe sub-variants.

The variant section should have at least one image showing the variant, plus a short accompanying paragraph explaining why the variant is important. Use bullet points to outline how to use in more detail (following bullet point guidelines above). Use Best practices `GuidanceCallout` components to highlight key best practices (following guidelines above). Link to the corresponding heading on the Examples page when there is a runnable example.

### Behaviors

H2 header: name of the behavior

Use this to describe a behavior relevant to the pattern’s functionality. Examples include error handling or responsive design.

Use images where possible and keep paragraphs short.

### Feedback

Keep this include at the end of `site/docs/patterns/<pattern-name>/index.mdx` to display the feedback section:

```
:fragment{src="../fragments/feedback.mdx"}
```

## Examples page structure

Put runnable examples in `examples.mdx`. Give each one a descriptive H2 heading and add instructions when users need to perform an action to see the behavior. Keep design guidance on `index.mdx`, with links to the relevant example headings, rather than repeating it beside every preview.

Write each example in `site/src/examples/patterns/<pattern-name>/<ExampleName>.tsx` and export it from that folder's `index.ts`. Show each exported example with its own preview on the Examples page:

```mdx
## Basic example

<LivePreview
  componentName="patterns/<pattern-name>"
  exampleName="<ExampleName>"
/>
```

Replace the template's `Default` example with the name you export. The website and generated Markdown use the same example source. Pattern Storybook stories should re-export these examples as well. Put code that several examples share in the file of the first example on the page that uses it, so that example's source is complete. Reference images from `site/public`, for example `/img/examples/avatar.png`, rather than importing them.

Generation fails for an exported pattern example that no page shows. Include each supported example, or remove an obsolete export. Guidance-only patterns do not need an examples folder or an Examples page.

## Docs for coding agents

Pattern guidance and Examples pages are also published as Markdown in `@salt-ds/core/docs/patterns`, so coding agents read guidance that matches the installed version. The generator keeps one index entry per pattern and adds links between its guidance and Examples files. See the [component page guide](../component-pages/README.md#6-docs-for-coding-agents) and [tooling/agent-docs](../../tooling/agent-docs/README.md).

Agents don't see images, so:

- Name the components and tokens that the anatomy, layout and color images show in the text as well, for example "Use `--salt-spacing-300` between sections."
- Write alt text for informative images, and use captions for extra explanation. Both are included in the Markdown.
- Keep behavior and usage guidance in text on the Guidance page, and include example source through `LivePreview` on the Examples page. The generated documents preserve those links and previews without duplicating the pattern in the index.
