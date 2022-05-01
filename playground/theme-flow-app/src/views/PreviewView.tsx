import { Button } from "@jpmorganchase/uitk-core";
import { SearchIcon } from "@jpmorganchase/uitk-icons";
import { HTMLAttributes } from "react";

export const PreviewView = (
  props: Omit<HTMLAttributes<HTMLDivElement>, "style"> & {
    /** Style may contain custom CSS var */
    style?: any;
  }
) => {
  return (
    <div {...props}>
      <Button variant="cta">
        <SearchIcon size={12} />
        {` CTA Button`}
      </Button>
      <Button variant="primary">
        <SearchIcon size={12} />
        {` Primary Button`}
      </Button>
      <Button variant="secondary">
        <SearchIcon size={12} />
        {` Secondary Button`}
      </Button>
    </div>
  );
};
