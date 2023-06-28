const exampleNameRegex = /[A-Z]?[a-z]+|[0-9]+|[A-Z]+(?![a-z])/g;

export const formatComponentExampleName = (name: string) => {
  const formattedName = name.match(exampleNameRegex);

  return formattedName ? formattedName.join(" ") : name;
};
