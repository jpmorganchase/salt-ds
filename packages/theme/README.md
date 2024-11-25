This is a regular package

---

## Tokens

1. Run "Export Color Styles" -> "Export Variables" -> "Json (Experimental)" from [PR#51](https://github.com/jpmorganchase/Figma-Plugins-and-Widgets/pull/51)
1. Select Collection and Mode on plugin UI
   1. Add "Additional Root Key (Optional)"
      - Colors library: 'color'
      - Palette library: 'palette'
1. Copy output to corresponding `*.tokens.json` file
1. Modify color tokens
   1. remove `categorical.` from , e.g. replace `"{color.categorical` to `"{color`

TODOs

- [ ] Custom value tranformer for `foundation/alpha-next.css` tokens, to achieve `rgba` syntax from `packages/theme/css/foundations/alpha-next.css`
