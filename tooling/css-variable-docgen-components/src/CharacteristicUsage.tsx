import { Spinner } from "@salt-ds/core";
import { useOf } from "@storybook/addon-docs";
import { ResetWrapper } from "@storybook/components";
import { useEffect, useState } from "react";
import { CharacteristicUsageRow } from "./CharacteristicUsageRow";
import { EmptyBlock } from "./EmptyBlock";
import { TableWrapper } from "./TableWrapper";
import { getCharacteristics } from "./utils";

import "./CharacteristicUsage.css";

export function CharacteristicUsage(
  props: Record<string, string>,
): JSX.Element {
  const { of } = props;

  const resolved = useOf(of);
  const characteristicTokenMap = getCharacteristics(resolved);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  if (isLoading) {
    return <Spinner className="characteristicTokenDoc-loading" />;
  }

  if (Object.keys(characteristicTokenMap).length === 0) {
    return (
      <EmptyBlock>
        No characteristics used directly for this component.
      </EmptyBlock>
    );
  }

  return (
    <ResetWrapper>
      <TableWrapper className="docblock-argstable sb-unstyled">
        <thead className="docblock-argstable-head">
          <tr>
            <th>
              <span>Characteristic</span>
            </th>
            <th>
              <span>Token</span>
            </th>
          </tr>
        </thead>
        <tbody className="docblock-argstable-body">
          {Object.entries(characteristicTokenMap)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([name, tokens]) => (
              <CharacteristicUsageRow key={name} name={name} tokens={tokens} />
            ))}
        </tbody>
      </TableWrapper>
    </ResetWrapper>
  );
}
