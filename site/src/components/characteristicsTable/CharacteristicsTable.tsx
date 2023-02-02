import getCharacteristics from "../../utils/getCharacteristics";
import useDynamicImport from "../../utils/useDynamicImportCSSDocgen";

export interface StringIndexedObject<T> {
  [key: string]: T;
}

export interface CSSData extends StringIndexedObject<CSSDataItem> {}

export interface CSSDataItem {
  name: string;
  fallbackValue: string;
  property: string;
}

export const CharacteristicsTable = ({
  name,
}: {
  name: string;
}): JSX.Element => {
  const cssData: CSSData = useDynamicImport(name);
  const identifierMap = cssData?.identifierMap;

  if (!identifierMap) return null;

  const characteristicTokenMap = getCharacteristics(identifierMap);

  return (
    <table>
      <thead>
        <tr>
          <th>Characteristic</th>
          <th>Tokens</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(characteristicTokenMap)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([name, tokens]) => (
            <tr key={name}>
              <td>{name}</td>
              <td>
                {tokens &&
                  tokens.map((token) => <div key={token}>{token}</div>)}
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};

export default CharacteristicsTable;
