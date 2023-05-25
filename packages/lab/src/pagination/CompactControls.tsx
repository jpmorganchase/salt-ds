import { FormFieldLegacyProps } from "../form-field-legacy";
import { CompactInput } from "./CompactInput";
import { PageButton } from "./PageButton";
import { withBaseName } from "./utils";

export interface CompactControlsProps {
  count: number;
  page: number;
  onPageChange: (page: number) => void;
  FormFieldLegacyProps?: Partial<FormFieldLegacyProps>;
}

export const CompactControls = ({
  page,
  count,
  onPageChange,
  FormFieldLegacyProps,
}: CompactControlsProps) => {
  return (
    <>
      <CompactInput
        page={page}
        count={count}
        onPageChange={onPageChange}
        FormFieldLegacyProps={FormFieldLegacyProps}
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
