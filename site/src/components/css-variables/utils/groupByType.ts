import { CSSVariableData } from "../CSSVariables";

export const groupByType = (data: CSSVariableData, regex: RegExp) => {
  const groupedData: { [key: string]: CSSVariableData } = {};

  Object.entries(data).forEach(([name, value]) => {
    const match = regex.exec(name);
    if (match && match[1]) {
      const groupName = match[1];
      if (!groupedData[groupName]) {
        groupedData[groupName] = {};
      }
      groupedData[groupName][name] = value;
    }
  });

  return groupedData;
};
