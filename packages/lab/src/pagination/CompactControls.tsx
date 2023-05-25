import { FormFieldLegacyProps as FormFieldProps } from "../form-field-legacy";
import { CompactInput } from "./CompactInput";
import { PageButton } from "./PageButton";
import { withBaseName } from "./utils";

export interface CompactControlsProps {
  count: number;
  page: number;
  onPageChange: (page: number) => void;
  FormFieldProps?: Partial<FormFieldProps>;
}

export const CompactControls = ({
  page,
  count,
  onPageChange,
  FormFieldProps,
}: CompactControlsProps) => {
  return (
    <>
      <CompactInput
        page={page}
        count={count}
        onPageChange={onPageChange}
        FormFieldProps={FormFieldProps}
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
