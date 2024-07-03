import { type characteristic, getCharacteristicValue } from "@salt-ds/core";
import { Markdown } from "@storybook/blocks";
import { ColorBlock } from "docs/components/ColorBlock";
import { ShadowBlockCell } from "docs/components/ShadowBlock";
import type { ReactElement } from "react";
import { Description, Name, StyledTd } from "./common";

interface CharacteristicUsageRowProps {
  name: string;
  tokens: string[];
}

const isColor = (value: string) => {
  const s = new Option().style;
  s.color = value;
  return s.color.length;
};

const isShadow = (value: string) => {
  const s = new Option().style;
  s.boxShadow = value;
  return s.boxShadow.length;
};

const TokenBlock = (props: { value: string; token: string }): ReactElement => {
  const { value, token } = props;

  if (isColor(value) || value === "transparent") {
    return <ColorBlock hideToken colorVar={token} />;
  }

  if (isShadow(value)) {
    return <ShadowBlockCell shadowVar={token} />;
  }

  return <Markdown className="token">{value.trim()}</Markdown>;
};

const TokenInfo = (props: { token: string }) => {
  const { token } = props;
  const characteristicName = token
    .split("--salt-")[1]
    .split("-")[0] as characteristic;

  const provider = document.querySelector<HTMLElement>(".salt-theme");

  if (!provider) {
    return null;
  }

  const value = getCharacteristicValue(
    "salt-theme",
    characteristicName,
    token.split(`${characteristicName}-`)[1],
    provider,
  );

  return (
    <Description className="characteristicTokenDoc-inTable" key={token}>
      {value && <TokenBlock value={value} token={token} />}
    </Description>
  );
};

export const CharacteristicUsageRow = (props: CharacteristicUsageRowProps) => {
  const { name, tokens } = props;

  return (
    <tr>
      <StyledTd>
        <Name>{name}</Name>
      </StyledTd>
      <td>
        {tokens?.map((token) => (
          <Description key={token}>
            <Markdown className="characteristicTokenDoc">{token}</Markdown>
          </Description>
        ))}
      </td>
      <td>
        {tokens?.map((token, i) => (
          <TokenInfo token={token} key={token} />
        ))}
      </td>
    </tr>
  );
};
