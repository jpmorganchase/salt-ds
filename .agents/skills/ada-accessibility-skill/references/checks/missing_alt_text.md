# Missing Alt Text for Images

Images without descriptive alt text prevent screen readers from conveying their purpose. Decorative images that are not properly hidden negatively impact the user experience when using screen readers.

## Checkpoint Covered

- **1.1.1-01** — Non-Text Content

## Common Issues

- Image has no alt attribute
- Image has generic alt text that doesn't describe the content or meaning (e.g., alt="chart", alt="image", alt="graph")
- Decorative image or image described in adjacent text is missing alt="" and aria-hidden="true"

## Remediation Rules

1. **Meaningful images**: Must have descriptive alt text that conveys the purpose, content, or key findings of the image
2. **Charts and graphs**: Should describe the chart type with appropriate and relevant information like key trend or finding, not just identify it as a chart. If the chart's content cannot be determined from surrounding text, filenames, headings, or image analysis, **flag for manual review**. Do not generate generic alt text like "chart" or "graph".
3. **Images fully described in adjacent text**: Add `alt=""` and `aria-hidden="true"` to avoid redundancy.
4. **Decorative images**: Add `alt=""` and `aria-hidden="true"` to hide from assistive technology.
5. **Logos**: Add alt text containing the company or entity name. Do not include the word "logo" by default. In the Guidance field, inform the developer that per the DAKB, the word "logo" should be added to the alt text if the purpose of the image is to indicate that a logo is being displayed, or if there is a business reason to brand the image as a logo. The developer can modify the alt text accordingly when reviewing the change.
6. **Standalone icons**: If an icon is not nested in an interactive element and does not include `aria-hidden`, analyze the icon's component name, surrounding content, and page context to determine if it is decorative or meaningful. If decorative, add `alt=""` and `aria-hidden="true"`. If meaningful, add appropriate alt text based on context. If the purpose cannot be determined with high confidence, **flag for manual review**. (This includes Salt icons)
7. **Icons inside buttons or links**: Add `aria-hidden="true"` to the icon. The accessible name should be on the parent element, not the icon.
8. **Do not use redundant phrases**: Avoid "image," "graphic," "photo of," "picture of," "photograph of," and "screenshot of" in alt text as screen readers already announce the element is an image

### Context Analysis

Before flagging an image for manual review, analyze all available application context:

- **Filename**: `company-logo.png` → likely a logo, use the company/product name as alt text. `decorative-border.png` → likely decorative.
- **Surrounding text and headings**: Adjacent text often describes the image's purpose or content. If the image is fully described by adjacent text, it should be treated as described-in-context (Rule 3).
- **Component and page context**: What page, section, or feature contains this image? A headshot on an "About" page likely needs a person's name.
- **Icon component names**: Salt and other icon library names describe purpose (e.g., `DownloadIcon`, `CloseIcon`, `SearchIcon`).
- **CSS classes and wrapper elements**: Class names like `decorative-divider`, `background-pattern` indicate decorative purpose.

**If vision capability is available** and the image file is accessible, also analyze the image to determine:
- Whether the image is decorative or meaningful
- Appropriate alt text that describes the image's purpose and content
- Key findings or trends for charts and graphs

Only flag for manual review when context analysis cannot determine the image's purpose or appropriate alt text with high confidence.

## Examples

```jsx
// CORRECT: Chart with descriptive alt text including key findings
<img src="quarterly-sales.png" alt="Bar chart showing quarterly sales with 15% decline from Q1 to Q2, 20% growth in Q3, and flat performance in Q4" />

// CORRECT: Image fully described in adjacent text, uses empty alt and aria-hidden
<Text>Website visitor statistics for Q1 2024 show Site 1 declining from 5,000 to 3,000 monthly visitors, Site 2 remaining steady at 4,000 visitors, and Site 3 increasing from 2,000 to 6,000 visitors.</Text>
<img src="visitor-stats-chart.png" alt="" aria-hidden="true" />

// CORRECT: Logo with company name
<img src="acme-corporation-logo.png" alt="Acme Corporation" />

// CORRECT: Headshot with person's name
<img src="john-smith-headshot.png" alt="Headshot of John Smith" />

// CORRECT: Decorative image with empty alt and aria-hidden
<img src="decorative-border.png" alt="" aria-hidden="true" />

// INCORRECT: Chart with generic alt text that doesn't describe findings
<img src="sales-chart.png" alt="Bar chart" />

// INCORRECT: Image described in adjacent text but missing empty alt and aria-hidden
<p>Annual revenue increased from $10M in 2023 to $13.5M in 2024, representing 35% growth.</p>
<img src="revenue-growth.png" />

// INCORRECT: Image missing alt attribute entirely
<img src="logo.png" />

// INCORRECT: Redundant "Image" in alt text
<img src="jane-doe-profile.png" alt="Image of Jane Doe" />

// INCORRECT: Generic alt text that doesn't describe content
<img src="network-diagram.png" alt="graph" />

// INCORRECT: Alt text only describes image type, not content
<img src="sales-data.png" alt="graphic" />

// INCORRECT: Chart alt text doesn't include findings or trends
<img src="revenue-chart.png" alt="Chart showing revenue" />

// CORRECT: Decorative Salt icon hidden from assistive technology
<div className="feature-icon">
  <HomeIcon size={2} aria-hidden="true" />
</div>
<H3>Personal Dashboard</H3>

// CORRECT: Meaningful standalone Salt icon with accessible name
<NotificationIcon aria-label="3 unread notifications" />

// CORRECT: Icon inside button hidden — button has aria-label
<Button aria-label="Settings">
  <SettingsIcon aria-hidden="true" />
</Button>

// INCORRECT: Decorative Salt icon not hidden — screen readers will announce it
<div className="feature-icon">
  <HomeIcon size={2} />
</div>
<H3>Personal Dashboard</H3>

// INCORRECT: Icon inside button missing aria-hidden (button already has aria-label)
<Button aria-label="Settings">
  <SettingsIcon />
</Button>
```