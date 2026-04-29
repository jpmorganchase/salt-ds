# Missing or Incorrect Language Attributes

Without proper language attributes, assistive technologies may not interpret content correctly, affecting pronunciation and translation. The `lang` attribute must be present and valid on the `<html>` element, must accurately reflect the principal language of the page, and must be used on elements containing content in a different language than the page.

## Checkpoints Covered

This file covers four DAKB checkpoints. Count each fix against the **specific** checkpoint it addresses. Do not double-count.

The `-01` checkpoints are about a `lang` attribute being **missing or invalid** (structural).
The `-02` checkpoints are about a `lang` value being **incorrect for the content** (accuracy).

### Quick-Reference Decision Tree

| Element | Missing or invalid `lang` | Valid `lang` but wrong language |
|---|---|---|
| `<html>` | **3.1.1-01** | **3.1.1-02** |
| Non-html element | **3.1.2-01** | **3.1.2-02** |

### 3.1.1-01 — HTML element must have a valid lang attribute

- **Scope:** `<html>` element only
- **What it checks:** The `<html>` element has a `lang` attribute AND its value is a valid IANA language code (BCP 47)
- **Count this checkpoint when:** Adding a missing `lang` attribute to `<html>`, removing whitespace-only values, or correcting an invalid language code (e.g., `lang="english"` → `lang="en"`)
- **Failures:** No `lang` attribute, empty `lang=""`, whitespace-only `lang=" "`, invalid code like `lang="english"` or `lang="xyz"`
- **Note:** If `<html>` has no `lang` at all and you add `lang="en"`, that is **one fix under 3.1.1-01 only**, not 3.1.1-01 + 3.1.1-02. The primary issue is the absence of the attribute.

### 3.1.1-02 — The correct language of the page must be communicated

- **Scope:** `<html>` element only
- **What it checks:** The `lang` value accurately identifies the principal language of the page content
- **Count this checkpoint when:** The `<html>` element already has a valid `lang` attribute, but the value is the wrong language for the content (e.g., page content is in English but `lang="es"` → change to `lang="en"`)
- **How to determine:** Read the actual rendered text content (headings, paragraphs, labels, navigation text). The language of the majority of the content is the principal language. There is no specific percentage threshold — consider user expectations, the page's location within the site, and the page title.
- **Note:** Screen reader announcements for roles, states, and properties (e.g., "heading," "expanded," "checked") are provided by the platform in the platform language, not the page language. If these differ from the page language, it is not a failure.

### 3.1.2-01 — All lang attribute usages must have valid values

- **Scope:** All elements **other than** `<html>` that have a `lang` attribute
- **What it checks:** Every `lang` attribute on non-html elements has a valid IANA language code (BCP 47)
- **Count this checkpoint when:** Adding a missing `lang` attribute to a non-html element that contains content in a different language, or correcting an invalid value on a non-html element (e.g., `lang="spansh"` → `lang="es"`)
- **Failures:** `<p lang="spansh">`, `<span lang="xyz">`, or any non-html element with an invalid language code
- **Note:** `lang` is a global HTML attribute — it may be placed on any HTML element. For language-of-parts purposes, it must be placed on an element within the `<body>`.

### 3.1.2-02 — Language changes must be identified

- **Scope:** All text content within the page that is in a different language than the `<html lang>` value
- **What it checks:** Elements with text in a different language have a `lang` attribute with the correct IANA code
- **Count this checkpoint when:** A non-html element already has a valid `lang` attribute, but the value is the wrong language for its content (e.g., `<p lang="fr">Este párrafo está en español.</p>` → `lang="es"`)
- **Exceptions — do NOT flag or add `lang` for:**
  - Proper names (people, places, companies)
  - Technical terms
  - Words of indeterminate origin
  - Foreign words or phrases that have become part of the common usage of the surrounding language (e.g., "voilà," "résumé," "fiesta," "bon voyage")
- **If unsure** whether a term is vernacular or requires a `lang` attribute, **flag for manual review**

## Detection (Where to Look)

The `<html>` tag may exist in multiple files depending on the application architecture. Check all applicable locations:

- Root HTML templates (common locations):
  - React/Vite/CRA: `public/index.html` or `index.html`
  - Angular: `src/index.html`
  - Vue: `public/index.html`
  - Next.js:
    - Pages Router: `pages/_document.tsx`
    - App Router: `app/layout.tsx`
- Language-of-parts: look for hard-coded passages, quotes, or sections that are clearly in a different language than the surrounding content.

## Remediation Rules

1. **Determine primary language (3.1.1-01, 3.1.1-02):** Read the actual text content rendered on the page (headings, paragraphs, labels, navigation text). Specify the primary language using the `lang` attribute on the `<html>` element. For example, if all visible content is in English, use `lang="en"`.
2. **Language codes (all checkpoints):** Use valid IANA language codes per BCP 47 (e.g., `en` for English, `es` for Spanish, `fr` for French).
3. **Content sections (3.1.2-01, 3.1.2-02):** Use `lang` attribute on elements containing content in a different language than the document's primary language. Apply the 3.1.2-02 exceptions before flagging — do not flag proper names, technical terms, or vernacular.
4. **Existing region code (all checkpoints):** Do not remove region codes if already present (e.g., `lang="en-US"` should remain as-is). Do not add a region code unless specifically instructed. Region subtag content is not validated by axe — for example, `lang="en-hello"` would pass axe because the primary language `en` is valid — but authors should only use a region subtag if it contributes meaningful information.
5. **Ambiguity (all checkpoints):** If the correct language cannot be determined from the content, do not guess and **flag for manual review**.

## Examples

```html
<!-- CORRECT (3.1.1-01): HTML with valid language attribute -->
<html lang="en">
  <!-- Document content -->
</html>

<!-- CORRECT (3.1.1-01): HTML with language + region variant
     Do not remove region if already specified.
     Do not add region unless instructed to do so. -->
<html lang="en-US">
  <!-- Document content -->
</html>

<!-- CORRECT (3.1.1-01): HTML with Spanish language attribute -->
<html lang="es">
  <!-- Document content -->
</html>

<!-- CORRECT (3.1.2-01, 3.1.2-02): Mixed language content with proper attributes -->
<html lang="en">
  <body>
    <p>This is in English.</p>
    <p lang="es">Este párrafo está en español.</p>
    <p lang="fr">Ce paragraphe est en français.</p>
  </body>
</html>

<!-- CORRECT (3.1.2-02 exception): Vernacular terms do NOT need lang attributes -->
<html lang="en">
  <body>
    <p>The chef prepared a lovely hors d'oeuvre.</p>
    <p>Voilà! The project is complete.</p>
    <p>Please send your résumé to the hiring manager.</p>
  </body>
</html>

<!-- INCORRECT (3.1.1-01): Missing language attribute entirely -->
<html>
  <!-- Document content -->
</html>

<!-- INCORRECT (3.1.1-01): Invalid language code -->
<html lang="english">
  <!-- Document content -->
</html>

<!-- INCORRECT (3.1.1-01): Empty language attribute -->
<html lang="">
  <!-- Document content -->
</html>

<!-- INCORRECT (3.1.1-02): Valid code but wrong language
     Page content is in English but lang says Spanish -->
<html lang="es">
  <body>
    <h1>Welcome to our application</h1>
    <p>This page is entirely in English.</p>
  </body>
</html>

<!-- INCORRECT (3.1.2-02): Language change not identified -->
<html lang="en">
  <body>
    <p>This is in English.</p>
    <p>Este párrafo está en español.</p>
  </body>
</html>

<!-- INCORRECT (3.1.2-01): Invalid lang value on non-html element -->
<html lang="en">
  <body>
    <p lang="spansh">Este párrafo está en español.</p>
  </body>
</html>
```