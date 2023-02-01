# Docs

Site docs should go in this folder.

## Implementation

Docs should contain as much plain markdown content as possible within the page so it can easily be updated if needed.

If doc pages use UI components, those should not contain hard-coded text, image URLs or other page content.

## File structure

If docs have additional files associated with them, such as page-specific UI components, styles, images, etc. then those should be placed into a sub-folder adjacent to the `.mdx` file.

The folder must have the same name as the corresponding page but with an underscore (\_) prefix, so that Docusaurus does not try to process it as a separate page.

```bash
site/
└── docs/
    ├── [doc_name].mdx
    └── _[doc_name]/
        ├── DocSpecificComponent.tsx
        └── DocSpecificComponent.module.css
```
