import { Handle, Position } from "reactflow";
import { Declaration } from "../utils/parseCssToFlowData";
import "./FlowCssVarNode.css";

export function FlowCssVarNode({ data }: { data: Declaration }) {
  return (
    <>
      <Handle type="target" position={Position.Left} />
      <div className="FlowCssVarNode ">
        <div>
          <div>{data.property}</div>
          <div>{data.value}</div>
        </div>
        <div
          className="FlowCssVarNode-preview"
          style={{ background: data.value }}
        ></div>
      </div>
      <Handle type="source" position={Position.Right} />
    </>
  );
}
