const exampleNameRegex = /[A-Z]?[a-z]+|[0-9]+|[A-Z]+(?![a-z])/g;

function format(value: string): string {
  return value.length > 0
    ? value[0].toUpperCase() + value.slice(1).toLowerCase()
    : value;
}

export const formatComponentExampleName = (
  exampleName: string,
  displayName?: string,
) => {
  if (displayName) {
    return displayName;
  }
  const formattedName = exampleName.match(exampleNameRegex);
  return formattedName ? format(formattedName.join(" ")) : exampleName;
};
