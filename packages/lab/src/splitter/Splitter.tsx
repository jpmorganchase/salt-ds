import { PanelGroup, type PanelGroupProps } from "react-resizable-panels";

export interface SplitterProps extends PanelGroupProps {}

export function Splitter(props: SplitterProps) {
  return <PanelGroup {...props} />;
}
