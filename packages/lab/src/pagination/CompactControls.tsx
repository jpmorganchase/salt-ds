import { FC } from "react";
import { CompactInput } from "./CompactInput";
import { FormFieldVariantType } from "../form-field";
import { withBaseName } from "./utils";
import { PageButton } from "./PageButton";

export interface CompactControlsProps {
  count: number;
  page: number;
  onPageChange: (page: number) => void;
  variant: FormFieldVariantType;
}

export const CompactControls: FC<CompactControlsProps> = ({
  page,
  count,
  onPageChange,
  variant,
}) => {
  return (
    <>
      <CompactInput
        page={page}
        count={count}
        onPageChange={onPageChange}
        variant={variant}
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
