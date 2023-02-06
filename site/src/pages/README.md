# Pages

Self contained pages should go in this folder.

## Implementation

Pages should contain as much content as possible within the page so it can easily be updated if needed.

## File structure

If pages have additional files associated with them, such as page-specific UI components, styles, images, etc. then those should be placed into a sub-folder adjacent to the `.tsx` or `.mdx` file.

The folder must have the same name as the corresponding page but with an underscore (\_) prefix, so that Docusaurus does not try to process it as a separate page.

```bash
site/
└── src/
    └── pages/
        ├── [page_name].tsx
        └── _[page_name]/
            ├── PageSpecificComponent.tsx
            └── PageSpecificComponent.module.css
```
