import { FC } from "react";
import Markdown from "markdown-to-jsx";
import { Name, Description, StyledTd } from "./common";

interface CharacteristicUsageRowProps {
  name: string;
  tokens: string[];
}

export const CharacteristicUsageRow: FC<CharacteristicUsageRowProps> = (
  props
) => {
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
              <Markdown>{token}</Markdown>
            </Description>
          ))}
      </td>
    </tr>
  );
};
