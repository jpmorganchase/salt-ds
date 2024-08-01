import { type Of, useOf } from "@storybook/addon-docs";
import { ResetWrapper } from "@storybook/components";
import { ClassNameRow } from "./ClassNameRow";
import { EmptyBlock } from "./EmptyBlock";
import { TableWrapper } from "./TableWrapper";
import { getClassNames } from "./utils";

export function CSSClassTable(props: { of: Of }): JSX.Element {
  const { of } = props;

  const resolved = useOf(of);
  const classNames = getClassNames(resolved);

  if (Object.values(classNames).length < 1) {
    return (
      <EmptyBlock>No CSS class names found for this component.</EmptyBlock>
    );
  }

  return (
    <ResetWrapper>
      <TableWrapper className="docblock-argstable sb-unstyled">
        <thead className="docblock-argstable-head">
          <tr>
            <th>
              <span>Name</span>
            </th>
            <th>
              <span>Description</span>
            </th>
          </tr>
        </thead>
        <tbody className="docblock-argstable-body">
          {Object.values(classNames).map((className) => (
            <ClassNameRow key={className.name} row={className} />
          ))}
        </tbody>
      </TableWrapper>
    </ResetWrapper>
  );
}
