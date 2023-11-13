import { FormFieldLegacyProps as FormFieldProps } from "../form-field-legacy";
import { CompactInput } from "./CompactInput";
import { PageButton } from "./PageButton";
import { withBaseName } from "./utils";

export interface CompactControlsProps {
  count: number;
  page: number;
  onPageChange: (page: number) => void;
  FormFieldProps?: Partial<FormFieldProps>;
  withInput?: boolean;
}

export const CompactControls = ({
  page,
  count,
  onPageChange,
  FormFieldProps,
  withInput = false,
}: CompactControlsProps) => {
  return (
    <>
      {withInput ? (
        <CompactInput
          page={page}
          count={count}
          onPageChange={onPageChange}
          FormFieldProps={FormFieldProps}
        />
      ) : (
        <PageButton
          page={page}
          onPageChange={onPageChange}
          disabled={page === count}
        />
      )}
      <span className={withBaseName("compactSeparator")}>of</span>
      <PageButton
        page={count}
        onPageChange={onPageChange}
        disabled={page === count}
      />
    </>
  );
};
