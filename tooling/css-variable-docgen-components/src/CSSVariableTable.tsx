import { DocsContext, getComponent } from "@storybook/addon-docs";
import { useContext } from "react";
import { resetComponents, TableWrapper } from "@storybook/components";
import { CSSVariableRow } from "./CSSVariableRow";
import { getDocgenSection } from "./utils";
import { EmptyBlock } from "./EmptyBlock";

const ResetWrapper = resetComponents.resetwrapper;

export interface CSSVariable {
  name: string;
  type?: string;
  defaultValue?: string;
}

export function CSSVariableTable(props: Record<string, string>): JSX.Element {
  const context = useContext(DocsContext);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const main = getComponent(props, context);
  const cssVariablesApi = getDocgenSection<Record<string, CSSVariable>>(
    main,
    "cssVariablesApi"
  );
  const name = getDocgenSection<string>(main, "displayName");

  if (!cssVariablesApi) {
    return <EmptyBlock>No CSS Variables found for this component.</EmptyBlock>;
  }

  return (
    <ResetWrapper>
      <TableWrapper className="docsblock-argstable">
        <thead className="docblock-argstable-head">
          <tr>
            <th>
              <span>Name</span>
            </th>
            <th>
              <span>Type</span>
            </th>
            <th>
              <span>Default value</span>
            </th>
          </tr>
        </thead>
        <tbody className="docblock-argstable-body">
          {Object.values(cssVariablesApi)
            .filter((variable) => variable.name.startsWith(`--uitk${name}`))
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((cssVariable) => (
              <CSSVariableRow key={cssVariable.name} row={cssVariable} />
            ))}
        </tbody>
      </TableWrapper>
    </ResetWrapper>
  );
}
