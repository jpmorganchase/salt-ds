# Components

Reusable components should go in this folder.

## Implementation

They should be implemented in a way that allows them to be used in other projects or even contributed into Salt's core library.

These components shouldn't have any hardcoded content or dependency on any site specific CSS.

## File structure

If components have additional files associated with them, such as styles, those should be placed in the same folder.

The folder must have the same name as the corresponding component.

```bash
site/
└── src/
    └── components/
        └── [component_name]/
            ├── [ComponentName].tsx
            └── [ComponentName].module.css
```
