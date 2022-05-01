import { useState, useCallback, useMemo } from "react";
import ReactFlow, {
  addEdge,
  FitViewOptions,
  applyNodeChanges,
  applyEdgeChanges,
  updateEdge,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
} from "react-flow-renderer";
import { Declaration } from "../utils/parseCssToFlowData";
import { FlowCssVarNode } from "./FlowCssVarNode";

// const initialNodes: Node[] = [
//   { id: "1", data: { label: "Node 1" }, position: { x: 5, y: 5 } },
//   { id: "2", data: { label: "Node 2" }, position: { x: 5, y: 100 } },
// ];

// const initialEdges: Edge[] = [{ id: "e1-2", source: "1", target: "2" }];

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

// The component is currently operating as an uncontrolled component
export function FlowView({
  initialNodes,
  initialEdges,
  onValueChange,
}: {
  initialNodes?: Node<Declaration>[];
  initialEdges?: Edge[];
  onValueChange?: (property: string, newValue: string) => void;
}) {
  const nodeTypes = useMemo(() => ({ flowCssVarNode: FlowCssVarNode }), []);

  const [nodes, setNodes] = useState<Node<Declaration>[]>(initialNodes ?? []);
  const [edges, setEdges] = useState<Edge[]>(initialEdges ?? []);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      console.log({ changes });

      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [setNodes]
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [setEdges]
  );
  // gets called after end of edge gets dragged to another source or target
  const onEdgeUpdate = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      console.log({ oldEdge, newConnection });
      // FIXME: We will only support updating left edge for now
      // find the target node
      const targetId = newConnection.target;
      if (targetId) {
        const oldTargetNode = nodes.find((n) => n.id === targetId)!;
        const newValue = "var(" + newConnection.source! + ")";
        // FIXME: go down the chain to update all nodes reference this one
        const changes: NodeChange[] = [
          {
            id: targetId,
            type: "remove",
          },
          {
            item: {
              ...oldTargetNode,
              data: {
                ...oldTargetNode.data,
                value: newValue,
              } as Declaration,
            },
            type: "add",
          },
        ];
        onValueChange?.(targetId, newValue);
        setNodes((nds) => applyNodeChanges(changes, nds));
        setEdges((els) => updateEdge(oldEdge, newConnection, els));
      }
    },
    [nodes]
  );

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  return (
    <ReactFlow
      nodeTypes={nodeTypes}
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onEdgeUpdate={onEdgeUpdate}
      onConnect={onConnect}
      fitView
      fitViewOptions={fitViewOptions}
    />
  );
}
