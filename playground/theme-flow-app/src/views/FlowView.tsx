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
import { FlowCssVarNode } from "./FlowCssVarNode";

// const initialNodes: Node[] = [
//   { id: "1", data: { label: "Node 1" }, position: { x: 5, y: 5 } },
//   { id: "2", data: { label: "Node 2" }, position: { x: 5, y: 100 } },
// ];

// const initialEdges: Edge[] = [{ id: "e1-2", source: "1", target: "2" }];

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

export function FlowView({
  initialNodes,
  initialEdges,
}: {
  initialNodes?: Node[];
  initialEdges?: Edge[];
}) {
  const nodeTypes = useMemo(() => ({ flowCssVarNode: FlowCssVarNode }), []);

  const [nodes, setNodes] = useState<Node[]>(initialNodes ?? []);
  const [edges, setEdges] = useState<Edge[]>(initialEdges ?? []);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
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
      setEdges((els) => updateEdge(oldEdge, newConnection, els));
    },
    []
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
