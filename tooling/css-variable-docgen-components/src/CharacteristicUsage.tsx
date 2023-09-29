import { useContext, useEffect, useState } from "react";
import { DocsContext, getComponent } from "@storybook/addon-docs";
import { ResetWrapper } from "@storybook/components";
import { Spinner } from "@salt-ds/core";
import { CharacteristicUsageRow } from "./CharacteristicUsageRow";
import { EmptyBlock } from "./EmptyBlock";
import { getCharacteristics, getDocgenSection } from "./utils";
import { TableWrapper } from "./TableWrapper";

import "./CharacteristicUsage.css";

interface CSSVariable {
  name: string;
  type?: string;
  defaultValue?: string;
}

export interface Characteristic {
  name: string;
  tokens?: string[];
}

export function CharacteristicUsage(
  props: Record<string, string>
): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const context = useContext(DocsContext);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const main = getComponent(props, context);
  const cssVariablesApi = getDocgenSection<Record<string, CSSVariable>>(
    main,
    "cssVariablesApi"
  );

  const characteristicTokenMap =
    getCharacteristics<Record<string, CSSVariable>>(cssVariablesApi);

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
