// A few stylelint utils are not exported
// copied from https://github.com/stylelint/stylelint/tree/main/lib/utils

export const isVarFunction = (node) =>
  node.type === "function" &&
  node.value === "var" &&
  node.nodes[0].value.startsWith("--");

export function declarationValueIndex(decl) {
  const raws = decl.raws;

  return [
    // @ts-expect-error -- TS2571: Object is of type 'unknown'.
    raws.prop?.prefix,
    // @ts-expect-error -- TS2571: Object is of type 'unknown'.
    raws.prop?.raw || decl.prop,
    // @ts-expect-error -- TS2571: Object is of type 'unknown'.
    raws.prop?.suffix,
    raws.between || ":",
    // @ts-expect-error -- TS2339: Property 'prefix' does not exist on type '{ value: string; raw: string; }'.
    raws.value?.prefix,
  ].reduce((count, str) => {
    if (str) {
      return count + str.length;
    }

    return count;
  }, 0);
}
