import { FC, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Table } from "../mdx/table";
import { code, p, ul } from "../mdx";

const components = { code, ul, p };

type PropsTableType = {
  /**
   * Package name e.g. core
   */
  packageName?: string;
  /**
   * Component name e.g. Button
   */
  componentName: string;
};

type Props = {
  [key: string]: {
    defaultValue?: { value: string };
    description: string;
    name: string;
    type: {
      name: string;
    };
  };
};

type ComponentData = {
  displayName: string;
  props: Props;
};

type JSONData = {
  props: Record<
    string,
    {
      name: string;
      type: { name: string };
      description: string;
      defaultValue?: { value: string };
    }
  >;
  displayName?: string;
};

export const PropsTable: FC<PropsTableType> = ({
  packageName = "core",
  componentName,
}) => {
  const [props, setProps] = useState({} as JSONData["props"]);

  useEffect(() => {
    async function fetchProps() {
      const props = (await import(`../../props/${packageName}-props.json`))
        .default as JSONData[];

      return props.find(({ displayName }) => displayName === componentName)
        ?.props;
    }

    fetchProps()
      .then((propsTableData) => {
        if (!propsTableData) {
          console.warn(
            `No props were found for the ${componentName} component.`
          );
        } else {
          setProps(propsTableData);
        }
      })
      .catch(() => {
        console.warn(`No props were found for the ${componentName} component.`);
      });
  }, [packageName, componentName]);

  return (
    <Table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Description</th>
          <th>Default</th>
        </tr>
      </thead>
      <tbody>
        {props &&
          Object.values(props).map(
            ({ name, type, description, defaultValue }) => (
              <tr key={name}>
                <td>{name}</td>
                <td>
                  <code>{type.name}</code>
                </td>
                <td>
                  <ReactMarkdown components={components}>
                    {description}
                  </ReactMarkdown>
                </td>
                <td>
                  <code>{defaultValue ? defaultValue.value : "-"}</code>
                </td>
              </tr>
            )
          )}
      </tbody>
    </Table>
  );
};
