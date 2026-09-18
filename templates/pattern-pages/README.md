# How to use the pattern page MDX template

Patterns are guides that help teams build design solutions for their project. The goal of the guide is to give teams the information that they can use to build a design solution.

This document outlines how to structure a pattern to best meet this goal. The structure is designed to be as flexible as possible to cover the wide variety of patterns.

Follow these steps to add a new pattern page to the Salt website.

## 1. Getting started

Copy the `pattern-name.mdx/` file into the [`site/docs/patterns/` directory](../../site/docs/patterns/) and rename it to your pattern's name in kebab case. For example `button-bar/`.

- 💡 **Tip:** If you are using GitHub's website to edit component docs, you can press the <kbd>.</kbd> key to launch a version of VS Code in your browser and copy the directory via that.

Read the [Salt content style guide](../../content-style-guide.md) to ensure your writing maintains consistency with other documentation.

Every new or edited pattern needs a concise summary, use/avoid guidance,
canonical imports and providers, applicability and stability, a
dependency-complete manifest-backed example, keyboard and accessibility
guidance, deprecations or migrations, and related records where relevant. Use
an explicit waiver with an owner and reason instead of filler for genuinely
inapplicable sections.

Keep authored normative guidance, generated API facts, inferred implementation
signals and test receipts separate. Every source, example, resource and link
destination must resolve to explicit public or internal visibility. Public
guidance that refers to an internal resource must include an authored public
fallback.

## 2. Filling in

### Style notes

Refer to the Salt content style guide: https://github.com/jpmorganchase/salt-ds/blob/main/content-style-guide.md

Further notes:

- Refer to the name of the pattern in sentence case, e.g., “button bar” not “Button Bar.” Use a/the articles. No need to mention in the introduction that it’s a pattern (e.g. “Button bar is a pattern that...”)---the user is on the pattern page section already.
- Patterns should avoid big blocks of text. Use bullet points and lists where possible, break up with visuals and images.
- Ensure where possible that information displayed in images has accompanying text outlining the information elsewhere. This helps with accessibility.
- Avoid repeating information where possible to ensure simplicity and clarity.
- Use images to illustrate points where possible.
- Use ExampleContainers with the label “Best practices” to highlight key best practices where relevant. If there is one point don’t use bullet points, but if there is more than one use bullet points. Keep points no longer than three sentences. Avoid placing more than three bullet points in a single container.
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

Add these three sections in bold type below:

**Components**: Links to the most relevant components used in the pattern

**Patterns**: Links to other related patterns

**Resources**: Links to storybook and Figma and other resources where needed. Separate internal links where needed by marking as internal-only.

When adding Figma links in the sidebar consider the below recommendations:

- Pattern templates link to the Patterns Templates library. If a pattern doesn't have a template, remove the link.
- Pattern stickers link to the Light component library by default. If a pattern doesn't have a sticker, remove the link.
- If a pattern has both templates and stickers, include both links.

## Structure

### Introduction

No header for the introduction.

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

The variant section should have at least one image showing the variant, plus a short accompanying paragraph explaining why the variant is important. Use bullet points to outline how to use in more detail (following bullet point guidelines above). Use Best practices ExampleContainers to highlight key best practices (following guidelines above).

### Behaviors

H2 header: name of the behavior

Use this to describe a behavior relevant to the pattern’s functionality. Examples include error handling or responsive design.

Use images where possible and keep paragraphs short.

### Feedback

Include the below to automatically include a feedback section:

```
:fragment{src="./fragments/feedback.mdx"}
```
