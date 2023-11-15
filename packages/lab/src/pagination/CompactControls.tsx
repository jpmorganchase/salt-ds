import { CompactInput } from "./CompactInput";
import { PageButton } from "./PageButton";
import { withBaseName } from "./utils";

export interface CompactControlsProps {
  count: number;
  page: number;
  onPageChange: (page: number) => void;
  withInput?: boolean;
}

export const CompactControls = ({
  page,
  count,
  onPageChange,
  withInput = false,
}: CompactControlsProps) => {
  return (
    <>
      {withInput ? (
        <CompactInput page={page} count={count} onPageChange={onPageChange} />
      ) : (
        <PageButton page={page} onPageChange={onPageChange} disabled />
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
