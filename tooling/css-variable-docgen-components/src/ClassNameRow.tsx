import Markdown from "markdown-to-jsx";
import { ClassName } from "./CSSClassTable";
import { Name, Description, StyledTd } from "./common";

interface ClassNameRowProps {
  row: ClassName;
}

export const ClassNameRow = (props: ClassNameRowProps) => {
  const { row } = props;
  const { name, description } = row;
  const hasDescription = description != null && description !== "";

  return (
    <tr>
      <StyledTd>
        <Name>{name}</Name>
      </StyledTd>

      <td>
        {hasDescription && (
          <Description>
            <Markdown>{description}</Markdown>
          </Description>
        )}
      </td>
    </tr>
  );
};
