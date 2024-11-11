This is a regular package

---

## Tokens

1. Run "Export Color Styles" -> "Export Variables" -> "Json (Experimental)"
1. Select Collection and Mode on plugin UI
1. Copy output to corresponding `*.tokens.json` file
1. Modify color tokens
   1. prefix value with `color.*`, e.g. replace `"{` to `"{color.`
   1. remove `categorical.` from , e.g. replace `"{color.categorical` to `"{color`
   1. add `palette` layer to `palette/*.tokens.json`
