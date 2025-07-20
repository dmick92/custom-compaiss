"use client";

import type { Connection, Edge, Node, NodeTypes } from "@xyflow/react";
import { useCallback, useEffect, useState } from "react";
import {
  addEdge,
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import { useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Circle,
  Clock,
  Diamond,
  Download,
  Redo2,
  Save,
  Settings,
  Square,
  Undo2,
  X,
} from "lucide-react";

import {
  DecisionNode,
  DelayNode,
  DocumentNode,
  EndNode,
  ProcessNode,
  StartNode,
} from "~/app/_components/flow-designer/nodes";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useTRPC } from "~/trpc/react";

// Industry standard node types
const nodeTypes: NodeTypes = {
  start: StartNode,
  end: EndNode,
  process: ProcessNode,
  decision: DecisionNode,
  document: DocumentNode,
  delay: DelayNode,
};

// Node palette component
function NodePalette({
  onAddNode,
}: {
  onAddNode: (type: string, label: string) => void;
}) {
  const nodeShapeTypes = [
    { type: "start", label: "Start", icon: Circle, color: "green" },
    { type: "end", label: "End", icon: Circle, color: "red" },
    { type: "process", label: "Process", icon: Square, color: "blue" },
    { type: "decision", label: "Decision", icon: Diamond, color: "yellow" },
    { type: "document", label: "Document", icon: Settings, color: "orange" },
    { type: "delay", label: "Delay", icon: Clock, color: "blue" },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-sm">Node Types</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {nodeShapeTypes.map((nodeType) => (
            <Button
              className="flex h-12 flex-col items-center justify-center"
              key={nodeType.type}
              onClick={() => onAddNode(nodeType.type, nodeType.label)}
              size="sm"
              variant="outline"
            >
              <nodeType.icon className="mb-1 h-4 w-4" />
              <span className="text-xs">{nodeType.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Properties panel component
function PropertiesPanel({
  selectedNode,
  onUpdateNode,
  onDeleteNode,
  onClose,
}: {
  selectedNode: Node;
  onUpdateNode: (
    nodeId: string,
    updates: Partial<Node["data"]> & { position?: { x: number; y: number } },
  ) => void;
  onDeleteNode: (nodeId: string) => void;
  onClose: () => void;
}) {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm">Node Properties</CardTitle>
        <Button
          className="h-6 w-6 p-0"
          onClick={onClose}
          size="sm"
          variant="ghost"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="node-label">Label</Label>
          <Input
            className="mt-1"
            id="node-label"
            onChange={(e) =>
              onUpdateNode(selectedNode.id, { label: e.target.value })
            }
            value={selectedNode.data.label as string}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="node-x">X Position</Label>
            <Input
              className="mt-1"
              id="node-x"
              disabled
              onChange={(e) =>
                onUpdateNode(selectedNode.id, {
                  position: {
                    x: Number.parseInt(e.target.value, 10) || 0,
                    y: selectedNode.position.y,
                  },
                })
              }
              type="number"
              value={Math.round(selectedNode.position.x)}
            />
          </div>
          <div>
            <Label htmlFor="node-y">Y Position</Label>
            <Input
              className="mt-1"
              id="node-y"
              disabled
              onChange={(e) =>
                onUpdateNode(selectedNode.id, {
                  position: {
                    x: selectedNode.position.x,
                    y: Number.parseInt(e.target.value, 10) || 0,
                  },
                })
              }
              type="number"
              value={Math.round(selectedNode.position.y)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="node-description">Description</Label>
          <Input
            className="mt-1"
            id="node-description"
            onChange={(e) =>
              onUpdateNode(selectedNode.id, { description: e.target.value })
            }
            placeholder="Enter node description..."
            value={selectedNode.data.description as string}
          />
        </div>

        <div>
          <Label htmlFor="node-type">Node Type</Label>
          <Input
            className="bg-muted mt-1"
            disabled
            id="node-type"
            value={selectedNode.type}
          />
        </div>

        <div className="space-y-2 pt-2">
          <Button
            className="w-full"
            onClick={() =>
              onUpdateNode(selectedNode.id, { label: selectedNode.data.label })
            }
            size="sm"
            variant="outline"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
          <Button
            className="w-full"
            onClick={() => onDeleteNode(selectedNode.id)}
            size="sm"
            variant="destructive"
          >
            Delete Node
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Properties panel component for edges
function EdgePropertiesPanel({
  selectedEdge,
  onUpdateEdge,
  onDeleteEdge,
  onClose,
}: {
  selectedEdge: Edge;
  onUpdateEdge: (edgeId: string, updates: Partial<Edge>) => void;
  onDeleteEdge: (edgeId: string) => void;
  onClose: () => void;
}) {
  const [label, setLabel] = useState<string>(selectedEdge.label as string);

  // Sync local label state when selectedEdge changes
  useEffect(() => {
    setLabel(selectedEdge.label as string);
  }, [selectedEdge]);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm">Edge Properties</CardTitle>
        <Button
          className="h-6 w-6 p-0"
          onClick={onClose}
          size="sm"
          variant="ghost"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Edge ID</Label>
          <Input className="bg-muted mt-1" disabled value={selectedEdge.id} />
        </div>
        <div>
          <Label>Source</Label>
          <Input
            className="bg-muted mt-1"
            disabled
            value={selectedEdge.source}
          />
        </div>
        <div>
          <Label>Target</Label>
          <Input
            className="bg-muted mt-1"
            disabled
            value={selectedEdge.target}
          />
        </div>
        <div>
          <Label htmlFor="edge-label">Label</Label>
          <Input
            className="mt-1"
            id="edge-label"
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Enter edge label..."
            value={label}
          />
        </div>
        <div className="space-y-2 pt-2">
          <Button
            className="w-full"
            onClick={() => onUpdateEdge(selectedEdge.id, { label })}
            size="sm"
            variant="outline"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
          <Button
            className="w-full"
            onClick={() => onDeleteEdge(selectedEdge.id)}
            size="sm"
            variant="destructive"
          >
            Delete Edge
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FlowDesignerPage() {
  const trpc = useTRPC();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [flowName, setFlowName] = useState<string>("Untitled Flow");
  // Undo/Redo stacks
  const [undoStack, setUndoStack] = useState<
    { nodes: Node[]; edges: Edge[] }[]
  >([]);
  const [redoStack, setRedoStack] = useState<
    { nodes: Node[]; edges: Edge[] }[]
  >([]);

  const searchParams = useSearchParams();
  const processId = searchParams.get("process");
  const { data: processData } = useQuery(
    trpc.process.getById.queryOptions(
      { id: processId ?? "" },
      { enabled: !!processId },
    ),
  );

  useEffect(() => {
    if (processData) {
      setFlowName(processData.name);
      const flowData = processData.flowData as Record<string, unknown> as {
        nodes?: Node[];
        edges?: Edge[];
      };
      setNodes(flowData.nodes ?? []);
      setEdges(flowData.edges ?? []);
    }
  }, [processData, setEdges, setNodes]);

  // In FlowDesignerPage, sync selectedNode with the latest node from state
  useEffect(() => {
    if (selectedNode) {
      const latest = nodes.find((n) => n.id === selectedNode.id);
      if (latest && latest !== selectedNode) {
        setSelectedNode(latest);
      }
    }
  }, [nodes, selectedNode]);

  // Helper to push current state to undo stack
  const pushToUndoStack = useCallback(() => {
    setUndoStack((stack) => [...stack, { nodes, edges }]);
    setRedoStack([]); // Clear redo stack on new action
  }, [nodes, edges]);

  // Wrap setNodes/setEdges to push to undo stack
  const setNodesWithHistory = useCallback(
    (updater: (nds: Node[]) => Node[]) => {
      pushToUndoStack();
      setNodes(updater);
    },
    [pushToUndoStack, setNodes],
  );
  const setEdgesWithHistory = useCallback(
    (updater: (eds: Edge[]) => Edge[]) => {
      pushToUndoStack();
      setEdges(updater);
    },
    [pushToUndoStack, setEdges],
  );

  // Undo/Redo handlers
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    setRedoStack((stack) => [...stack, { nodes, edges }]);
    const prev = undoStack[undoStack.length - 1];
    if (!prev) return;
    setNodes(prev.nodes);
    setEdges(prev.edges);
    setUndoStack((stack) => stack.slice(0, -1));
  }, [undoStack, nodes, edges, setNodes, setEdges]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    setUndoStack((stack) => [...stack, { nodes, edges }]);
    const next = redoStack[redoStack.length - 1];
    if (!next) return;
    setNodes(next.nodes);
    setEdges(next.edges);
    setRedoStack((stack) => stack.slice(0, -1));
  }, [redoStack, nodes, edges, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdgesWithHistory((eds: Edge[]) => addEdge(params, eds)),
    [setEdgesWithHistory],
  );

  const onNodeClick = useCallback((_event: unknown, node: Node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  const onEdgeClick = useCallback((_event: unknown, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  // Use setNodesWithHistory/setEdgesWithHistory in mutating actions
  const addNode = useCallback(
    (type: string, label: string) => {
      setNodesWithHistory((nds: Node[]) => [
        ...nds,
        {
          id: `${type}-${Date.now()}`,
          type,
          position: { x: Math.random() * 400, y: Math.random() * 400 },
          data: { label },
        },
      ]);
    },
    [setNodesWithHistory],
  );

  const updateNode = useCallback(
    (
      nodeId: string,
      updates: Partial<Node["data"]> & { position?: { x: number; y: number } },
    ) => {
      setNodesWithHistory((nds: Node[]) =>
        nds.map((node: Node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: { ...node.data, ...updates },
              position: updates.position ?? node.position,
            };
          }
          return node;
        }),
      );
    },
    [setNodesWithHistory],
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodesWithHistory((nds: Node[]) =>
        nds.filter((node: Node) => node.id !== nodeId),
      );
      setEdgesWithHistory((eds: Edge[]) =>
        eds.filter(
          (edge: Edge) => edge.source !== nodeId && edge.target !== nodeId,
        ),
      );
      setSelectedNode(null);
    },
    [setNodesWithHistory, setEdgesWithHistory],
  );

  const deleteEdge = useCallback(
    (edgeId: string) => {
      setEdgesWithHistory((eds: Edge[]) =>
        eds.filter((edge: Edge) => edge.id !== edgeId),
      );
      setSelectedEdge(null);
    },
    [setEdgesWithHistory],
  );

  const updateEdge = useCallback(
    (edgeId: string, updates: Partial<Edge>) => {
      setEdgesWithHistory((eds: Edge[]) =>
        eds.map((edge: Edge) => {
          if (edge.id === edgeId) {
            return {
              ...edge,
              ...updates, // Only update top-level properties like label
            };
          }
          return edge;
        }),
      );
    },
    [setEdgesWithHistory],
  );

  const saveMutation = useMutation(
    trpc.process.save.mutationOptions({
      onSuccess: () => {
        alert(`Flow "${flowName}" saved successfully!`);
      },
      onError: (err: { message: string }) => {
        alert(`Failed to save: ${err.message}`);
      },
    }),
  );

  const handleSave = useCallback(() => {
    //if (processId) {
    saveMutation.mutate({
      id: processId,
      name: flowName,
      flowData: { nodes, edges },
    });
    // } else {
    //     // fallback: localStorage
    //     const flowData = {
    //         name: flowName,
    //         flowData: { nodes, edges },
    //         createdAt: new Date().toISOString(),
    //         updatedAt: new Date().toISOString(),
    //     };
    //     localStorage.setItem("savedFlow", JSON.stringify(flowData));
    //     alert(`Flow "${flowName}" saved locally!`);
    // }
  }, [processId, flowName, nodes, edges, saveMutation]);

  const handleExport = useCallback(() => {
    const flowData = {
      name: flowName,
      nodes,
      edges,
      exportedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(flowData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${flowName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [flowName, nodes, edges]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="bg-background flex h-16 items-center justify-between border-b px-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold">Flow Designer</h1>
          <div className="flex items-center space-x-2">
            <Label className="text-sm font-medium" htmlFor="flow-name">
              Flow Name:
            </Label>
            <Input
              className="w-48"
              id="flow-name"
              onChange={(e) => setFlowName(e.target.value)}
              placeholder="Enter flow name..."
              value={flowName}
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            className="flex items-center"
            onClick={handleUndo}
            size="sm"
            variant="outline"
            disabled={undoStack.length === 0}
          >
            <Undo2 className="mr-1 h-4 w-4" /> Undo
          </Button>
          <Button
            className="flex items-center"
            onClick={handleRedo}
            size="sm"
            variant="outline"
            disabled={redoStack.length === 0}
          >
            <Redo2 className="mr-1 h-4 w-4" /> Redo
          </Button>
          <Button
            className="flex items-center space-x-2"
            onClick={handleExport}
            size="sm"
            variant="outline"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
          <Button
            className="flex items-center space-x-2"
            onClick={handleSave}
            size="sm"
          >
            <Save className="h-4 w-4" />
            <span>Save Flow</span>
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - Node palette */}
        <div className="bg-background w-72 overflow-y-auto border-r p-4">
          <NodePalette onAddNode={addNode} />
        </div>

        {/* Center - Flow canvas */}
        <div className="flex-1">
          <ReactFlow
            edges={edges}
            fitView
            nodes={nodes}
            nodeTypes={nodeTypes}
            onConnect={onConnect}
            onEdgeClick={onEdgeClick}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onNodesChange={onNodesChange}
            onPaneClick={onPaneClick}
            proOptions={{
              hideAttribution: true,
            }}
            snapToGrid
            snapGrid={[10, 10]}
            defaultViewport={{ x: 0, y: 0, zoom: 2 }}
            translateExtent={[
              [0, 0],
              [+10000, +10000],
            ]}
            nodeExtent={[
              [10, 10],
              [+10000, +10000],
            ]}
          >
            <Controls showInteractive={false} />
            <Background />
            <MiniMap />
          </ReactFlow>
        </div>

        {/* Right sidebar - Properties panel (node or edge) */}
        {selectedNode && (
          <div className="bg-background w-80 overflow-y-auto border-l p-4">
            <PropertiesPanel
              onClose={() => setSelectedNode(null)}
              onDeleteNode={deleteNode}
              onUpdateNode={updateNode}
              selectedNode={selectedNode}
            />
          </div>
        )}
        {!selectedNode && selectedEdge && (
          <div className="bg-background w-80 overflow-y-auto border-l p-4">
            <EdgePropertiesPanel
              onClose={() => setSelectedEdge(null)}
              onDeleteEdge={deleteEdge}
              onUpdateEdge={updateEdge}
              selectedEdge={selectedEdge}
            />
          </div>
        )}
      </div>
    </div>
  );
}
