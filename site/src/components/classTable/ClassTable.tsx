import useDynamicImport from "../../utils/useDynamicImportCSSDocgen";

export interface StringIndexedObject<T> {
  [key: string]: T;
}

export interface CSSData extends StringIndexedObject<CSSDataItem> {}

export interface CSSDataItem {
  name: string;
  description: string;
}

export const ClassTable = ({ name }: { name: string }): JSX.Element => {
  const cssData: CSSData = useDynamicImport(name);
  const classNames = cssData && cssData.classNames;

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {cssData &&
          Object.keys(classNames).map((key) => {
            return (
              <tr key={key}>
                <td>
                  <code>{classNames[key].name}</code>
                </td>
                <td>{classNames[key].description}</td>
              </tr>
            );
          })}
      </tbody>
    </table>
  );
};

export default ClassTable;
