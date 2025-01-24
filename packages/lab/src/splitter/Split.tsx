import { Panel, type PanelProps } from "react-resizable-panels";

export interface SplitProps extends PanelProps {}

export function Split(props: SplitProps) {
  return <Panel {...props} />;
}
