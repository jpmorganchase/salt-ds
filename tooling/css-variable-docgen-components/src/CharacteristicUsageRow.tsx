import Markdown from "markdown-to-jsx";
import { characteristic, getCharacteristicValue } from "@salt-ds/core";
import { ColorBlock } from "docs/components/ColorBlock";
import { Name, Description, StyledTd } from "./common";
import { useEffect, useState } from "react";
import { ShadowBlockCell } from "docs/components/ShadowBlock";

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

const TokenInfo = (props: { token: string }) => {
  const { token } = props;
  const characteristicName = token
    .split("--salt-")[1]
    .split("-")[0] as characteristic;
  const [value, setValue] = useState<string | null>();

  useEffect(() => {
    setValue(
      getCharacteristicValue(
        "salt-theme",
        characteristicName,
        token.split(`${characteristicName}-`)[1]
      )
    );
  }, []);

  return (
    <Description className="characteristicTokenDoc-inTable" key={token}>
      {value &&
        ((isColor(value) || value === "transparent") && !isShadow(value) ? (
          <ColorBlock hideToken colorVar={token} />
        ) : isShadow(value) ? (
          <ShadowBlockCell shadowVar={token} />
        ) : (
          <Markdown className="token">{value.trim()}</Markdown>
        ))}
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
        {tokens &&
          tokens.map((token) => (
            <Description key={token}>
              <Markdown className="characteristicTokenDoc">{token}</Markdown>
            </Description>
          ))}
      </td>
      <td>{tokens && tokens.map((token) => <TokenInfo token={token} />)}</td>
    </tr>
  );
};
