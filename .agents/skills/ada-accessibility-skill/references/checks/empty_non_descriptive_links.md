# Empty or Non-Descriptive Links

Links without text or with non-descriptive text that lacks sufficient context make it difficult or impossible for screen reader users to determine the link's purpose. Link text should clearly describe the link's purpose or destination, either from the link text alone or from the link text combined with its programmatically determinable context. This applies to Salt Link components, HTML `<a>` elements, and elements with `role="link"`.

## Checkpoint Covered

- **2.4.4-01** — Link Purpose (In Context)

## Common Issues

- Link has no text content
- Link uses non-descriptive text like "click here", "read more", "learn more", "see more", "view details", "here", "more", "link", "go", "continue" where the surrounding programmatically determinable context does not sufficiently describe the link's destination or purpose
- Link text doesn't describe the destination or purpose even when considering context
- Icon-only link missing `aria-label`

## Understanding "In Context" (per DAKB 2.4.4-01)

The purpose of a link can be determined from:
- The link text alone, OR
- The link text combined with programmatically determinable context:
  - Text in the same paragraph as the link
  - Text in the same list item as the link
  - Text in the same table cell, row, or associated header
  - Text in the preceding heading

**Example:** "Read more" alone is non-descriptive, but in context it may be acceptable even if not ideal:
```jsx
// Acceptable (not a violation): Context from same paragraph makes purpose clear
<Text><Link href="/wcag">Read more</Link> about the WCAG 2.1 accessibility standards.</Text>
// Best practice: Use descriptive link text when possible. Screen readers provide a
// "link list" feature that lets users view all links on a page in a list. This list
// shows only the link text without surrounding context, so "Read more" alone would
// not be meaningful. Descriptive text like "Read more about WCAG 2.1 standards" is preferred.
```

## Remediation Rules

1. **Link is icon-only with no accessible name**: Add `aria-label` describing the link's destination/purpose.
2. **Link has non-descriptive text without sufficient programmatically determinable context**: Analyze the full page context — headings, paragraphs, surrounding components, page purpose, and href value — to determine whether the link's purpose is clear. If the purpose truly cannot be determined from available context, **flag for manual review**. Include a recommendation based on your analysis of the surrounding content and page structure.
3. **Link has non-descriptive text with context**: May be acceptable per checkpoint. Evaluate whether the link in context makes purpose clear. If acceptable, include in **Best Practice Recommendations** section of the output (not as a violation).
4. **Icon inside link is missing `aria-hidden="true"`**: Add `aria-hidden="true"` to the icon. *Note: Adding `aria-hidden="true"` to an icon is an image accessibility fix. Count each icon hidden under 1.1.1-01 in the summary, not under 2.4.4-01.*
5. **Best practice — non-descriptive text with sufficient context**: If a link uses non-descriptive text (e.g., "click here", "read more") but passes the checkpoint because surrounding context makes the purpose clear, do NOT flag it as a violation. Instead, include it in the **Best Practice Recommendations** section of the output. Screen readers provide a "link list" feature that lets users pull up and navigate a list of all links on the page — this list shows only the link text without any surrounding context, so descriptive link text is always preferred.

## Examples

### Using Salt Design System

```jsx
// CORRECT: Link with descriptive text
<Link href="https://www.w3.org/WAI/WCAG21/">
  WCAG 2.1 accessibility guidelines
</Link>

// CORRECT: Link with descriptive text in context
<Text>
  Learn more about the{" "}
  <Link href="https://www.w3.org/WAI/WCAG21/quickref/" target="_blank">
    WCAG 2.1 accessibility guidelines quickref
  </Link>
</Text>

// CORRECT: Standalone descriptive link
<Link href="https://saltdesignsystem.com/salt/components">
  View Salt Design System components
</Link>

// CORRECT: Icon-only link with aria-label
<Link href="https://twitter.com/company" aria-label="Company Twitter profile">
  <TwitterIcon aria-hidden="true" />
</Link>

// INCORRECT: Empty link with no text
<Link href="profile.html"></Link>

// INCORRECT: "Click here" with vague context — "to learn more" does not describe the link's destination or purpose
<Text>To learn more, <Link href="/docs">click here</Link></Text>

// ACCEPTABLE (not a violation): "Click here" with sufficient descriptive context in same paragraph
<Text>To learn more about how we process payments, <Link href="/docs">click here</Link></Text>
// Best practice: Use descriptive link text when possible (e.g., "learn about payment processing").
// Screen readers provide a "link list" feature that lets users view all links on a page in a list.
// This list shows only the link text without surrounding context, so "click here" alone would not
// be meaningful in that navigation mode.

// FLAG FOR MANUAL REVIEW: Link text describes content type but not specifically what documentation
<Link href="/docs">Documentation</Link>
```

### HTML Implementation

```html
<!-- CORRECT: Link with descriptive text -->
<a href="https://www.w3.org/WAI/WCAG21">
  WCAG 2.1 accessibility guidelines
</a>

<!-- CORRECT: Link with descriptive text in context -->
<p>
  Learn more about the
  <a href="https://www.w3.org/WAI/WCAG21/quickref/" target="_blank">
    WCAG 2.1 accessibility guidelines quickref
  </a>
</p>

<!-- CORRECT: Link with icon hidden -->
<a href="/settings">
  <i class="settings-icon" aria-hidden="true"></i>
  Settings
</a>

<!-- INCORRECT: Empty link with no text -->
<a href="profile.html"></a>

<!-- INCORRECT: "Click here" with vague context — "to learn more" does not describe the link's destination or purpose -->
<p>To learn more, <a href="/docs">click here</a></p>

<!-- INCORRECT: Link with icon but icon not hidden -->
<a href="/settings">
  <i class="settings-icon"></i>
  Settings
</a>
```