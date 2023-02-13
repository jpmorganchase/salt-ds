import { useDynamicImport } from "docusaurus-plugin-react-docgen-typescript/dist/esm/hooks";

export interface StringIndexedObject<T> {
  [key: string]: T;
}

export interface Props extends StringIndexedObject<PropItem> {}

export interface PropItemType {
  name: string;
  value?: any;
  raw?: string;
}

export interface ParentType {
  name: string;
  fileName: string;
}

export interface PropItem {
  name: string;
  required: boolean;
  type: PropItemType;
  description: string;
  defaultValue: any;
  parent?: ParentType;
  declarations?: ParentType[];
  tags?: {};
}

export const PropTable = ({ name }: { name: string }): JSX.Element => {
  const props: Props = useDynamicImport(name);

  if (!props) {
    return null;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Default Value</th>
          <th>Required</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {Object.keys(props).map((key) => {
          return (
            <tr key={key}>
              <td>
                <code>{key}</code>
              </td>
              <td>
                <code>{props[key].type?.name}</code>
              </td>
              <td>
                {props[key].defaultValue && (
                  <code>{props[key].defaultValue.value}</code>
                )}
              </td>
              <td>{props[key].required ? "Yes" : "No"}</td>
              <td>{props[key].description}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default PropTable;
