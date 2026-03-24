export function formatTokenValue(value: string) {
  let formattedValue = value.trim();
  let hasChanged = false;

  while (true) {
    if (formattedValue.startsWith("var(") && formattedValue.endsWith(")")) {
      formattedValue = formattedValue.slice(4, -1).trim();
      hasChanged = true;
      continue;
    }

    if (hasMatchingWrappingQuotes(formattedValue)) {
      formattedValue = formattedValue.slice(1, -1).trim();
      hasChanged = true;
      continue;
    }

    break;
  }

  return hasChanged ? formattedValue : value;
}

function hasMatchingWrappingQuotes(value: string) {
  return (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  );
}
