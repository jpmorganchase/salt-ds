import { Table, TBody, TD, TH, THead, TR } from "@salt-ds/core";
import dynamic from "next/dynamic";
import { type FC, useEffect, useState } from "react";
import { Code } from "../mdx/code";
import styles from "./PropsTable.module.css";

const Markdown = dynamic(() => import("../markdown/Markdown"));

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

type PropType = {
  name: string;
  raw?: string;
  value?: unknown;
};

type JSONData = {
  props: Record<
    string,
    {
      name: string;
      type: PropType;
      description: string;
      defaultValue?: { value: string };
    }
  >;
  displayName?: string;
};

const MAX_ENUM_VALUES = 12;

/**
 * propsGen.js extracts literal unions as enums, whose name is "enum", so show
 * their values instead (matching the docs generated for coding agents).
 */
function formatType(type: PropType) {
  if (type.name !== "enum") return type.name;
  if (
    Array.isArray(type.value) &&
    type.value.length > 0 &&
    type.value.length <= MAX_ENUM_VALUES
  ) {
    return type.value
      .map((item: { value?: unknown }) => String(item?.value))
      .join(" | ");
  }
  return type.raw ?? type.name;
}

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
            `No props were found for the ${componentName} component.`,
          );
        } else {
          setProps(propsTableData);
        }
      })
      .catch(() => {
        console.warn(`No props were found for the ${componentName} component.`);
      });
  }, [packageName, componentName]);

  if (Object.keys(props).length === 0) {
    return null;
  }

  return (
    <Table className={styles.propsTable}>
      <THead>
        <TR>
          <TH>Name</TH>
          <TH>Type</TH>
          <TH>Description</TH>
          <TH>Default</TH>
        </TR>
      </THead>
      <TBody>
        {props &&
          Object.values(props).map(
            ({ name, type, description, defaultValue }) => (
              <TR key={name}>
                <TD className={styles.overflowWrap}>{name}</TD>
                <TD>
                  <Code>{formatType(type)}</Code>
                </TD>
                <TD>
                  <Markdown>{description}</Markdown>
                </TD>
                <TD>
                  <Code>{defaultValue ? defaultValue.value : "-"}</Code>
                </TD>
              </TR>
            ),
          )}
      </TBody>
    </Table>
  );
};
