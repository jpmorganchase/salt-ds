import { Link } from "@jpmorganchase/uitk-lab";
import { ReactNode } from "react";

type PanelsDataType = {
  summary: string;
  content: ReactNode;
  expanded?: boolean;
  defaultExpanded?: boolean;
  disabled?: boolean;
  preventUnmountOnCollapse?: boolean;
};

export const panelsData: PanelsDataType[] = [
  {
    summary: "My first Panel",
    preventUnmountOnCollapse: false,
    content: (
      <div>
        My first panel content <Link href="#">Link 1</Link>
      </div>
    ),
  },
  {
    summary: "My second Panel",
    defaultExpanded: true,
    content: (
      <div>
        My second panel content <Link href="#">Link 2</Link>
      </div>
    ),
  },
  {
    summary: "My third Panel",
    disabled: true,
    content: (
      <div>
        My third panel content <Link href="#">Link 3</Link>
      </div>
    ),
  },
];
