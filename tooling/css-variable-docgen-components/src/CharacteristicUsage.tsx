import { UITK_CHARACTERISTICS } from "@jpmorganchase/theme-editor/src/utils/uitkValues";
import { DocsContext, getComponent } from "@storybook/addon-docs";
import { ResetWrapper, TableWrapper } from "@storybook/components";
import { useContext } from "react";
import { CharacteristicUsageRow } from "./CharacteristicUsageRow";
import { EmptyBlock } from "./EmptyBlock";
import { getDocgenSection } from "./utils";

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

  const characteristicTokenMap = getDocgenSection<
    Record<string, Characteristic>
  >(main, "characteristicFoundationTokenMap");

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
          {Object.values(characteristicTokenMap)
            .filter((a) => UITK_CHARACTERISTICS.includes(a.name))
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((characteristic) => (
              <CharacteristicUsageRow
                key={characteristic.name}
                row={characteristic}
              />
            ))}
        </tbody>
      </TableWrapper>
    </ResetWrapper>
  );
}
