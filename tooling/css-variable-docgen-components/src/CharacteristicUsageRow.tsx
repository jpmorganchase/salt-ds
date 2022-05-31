import { FC } from "react";
import Markdown from "markdown-to-jsx";
import { Name, Description, StyledTd } from "./common";
import { Characteristic } from "./CharacteristicUsage";

interface CharacteristicUsageRowProps {
  row: Characteristic;
}

export const CharacteristicUsageRow: FC<CharacteristicUsageRowProps> = (
  props
) => {
  const { row } = props;
  const { name, tokens } = row;

  return (
    <tr>
      <StyledTd>
        <Name>{name}</Name>
      </StyledTd>

      <td>
        {tokens &&
          tokens.map((token) => (
            <Description>
              <Markdown>{token}</Markdown>
            </Description>
          ))}
      </td>
    </tr>
  );
};
