import { SALT_CHARACTERISTICS } from "@salt-ds/theme-editor/src/utils/saltValues";

const getCharacteristics = <T>(
  cssVariablesApi: T
): Record<string, string[]> => {
  const characteristicFoundationTokenMap: Record<string, string[]> = {};

  Object.keys(cssVariablesApi).forEach((token) => {
    if (token.startsWith("--salt-")) {
      const characteristicName = token.replace("--salt-", "").split("-")[0];
      if (
        characteristicName.length &&
        SALT_CHARACTERISTICS.includes(characteristicName)
      ) {
        if (!characteristicFoundationTokenMap[characteristicName]) {
          characteristicFoundationTokenMap[characteristicName] = [token];
        } else if (
          !characteristicFoundationTokenMap[characteristicName]?.includes(token)
        ) {
          characteristicFoundationTokenMap[characteristicName].push(token);
        }
      }
    }
  });

  return characteristicFoundationTokenMap;
};

export default getCharacteristics;
