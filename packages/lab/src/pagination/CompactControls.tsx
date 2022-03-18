import { FC } from "react";
import { CompactInput } from "./CompactInput";
import { withBaseName } from "./utils";
import { PageButton } from "./PageButton";

export interface CompactControlsProps {
  count: number;
  page: number;
  onPageChange: (page: number) => void;
  emphasis: "low" | "medium" | "high";
}

export const CompactControls: FC<CompactControlsProps> = ({
  page,
  count,
  onPageChange,
  emphasis,
}) => {
  return (
    <>
      <CompactInput
        page={page}
        count={count}
        onPageChange={onPageChange}
        emphasis={emphasis}
      />
      <span className={withBaseName("compactSeparator")}>of</span>
      <PageButton
        page={count}
        onPageChange={onPageChange}
        disabled={page === count}
      />
    </>
  );
};
