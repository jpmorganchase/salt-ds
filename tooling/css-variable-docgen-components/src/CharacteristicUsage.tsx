import { DocsContext, getComponent } from "@storybook/addon-docs";
import { resetComponents, TableWrapper } from "@storybook/components";
import { useContext } from "react";
import { CharacteristicUsageRow } from "./CharacteristicUsageRow";
import { CSSVariable } from "./CSSVariableTable";
import { EmptyBlock } from "./EmptyBlock";
import { getCharacteristics, getDocgenSection } from "./utils";

const ResetWrapper = resetComponents.resetwrapper;

export interface Characteristic {
  name: string;
  tokens?: string[];
}

export function CharacteristicUsage(
  props: Record<string, string>
): JSX.Element {
  const context = useContext(DocsContext);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const main = getComponent(props, context);

  const cssVariablesApi = getDocgenSection<Record<string, CSSVariable>>(
    main,
    "cssVariablesApi"
  );

  const characteristicTokenMap =
    getCharacteristics<Record<string, CSSVariable>>(cssVariablesApi);

  if (!characteristicTokenMap) {
    return <EmptyBlock>No characteristics used for this component.</EmptyBlock>;
  }

  return (
    <ResetWrapper>
      <TableWrapper className="docsblock-argstable">
        <thead className="docblock-argstable-head">
          <tr>
            <th>
              <span>Characteristic</span>
            </th>
            <th>
              <span>Tokens</span>
            </th>
          </tr>
        </thead>
        <tbody className="docblock-argstable-body">
          {Object.entries(characteristicTokenMap)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([name, tokens]) => (
              <CharacteristicUsageRow name={name} tokens={tokens} />
            ))}
        </tbody>
      </TableWrapper>
    </ResetWrapper>
  );
}
