import Markdown from "markdown-to-jsx";
import { CSSVariable } from "./CSSVariableTable";
import { Name, Description, StyledTd } from "./common";

interface CSSVariableRowProps {
  row: CSSVariable;
}

export const CSSVariableRow = (props: CSSVariableRowProps) => {
  const { row } = props;
  const { name, type, defaultValue } = row;
  const hasType = type != null && type !== "";
  const hasDefaultValue = defaultValue != null && defaultValue !== "";
  return (
    <tr>
      <StyledTd>
        <Name>{name}</Name>
      </StyledTd>

      <td>
        {hasType && (
          <Description>
            <Markdown>{type}</Markdown>
          </Description>
        )}
      </td>

      <td>
        {hasDefaultValue && (
          <Description>
            <Markdown>{defaultValue}</Markdown>
          </Description>
        )}
      </td>
    </tr>
  );
};
