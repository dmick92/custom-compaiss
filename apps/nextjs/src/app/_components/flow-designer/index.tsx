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

import {
  Circle,
  Clock,
  Diamond,
  Download,
  Save,
  Settings,
  Square,
  X,
} from "lucide-react";

import type { ProcessData } from "~/app/lib/process-utils";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  DecisionNode,
  DelayNode,
  DocumentNode,
  EndNode,
  ProcessNode,
  StartNode,
} from "./nodes";

// Industry standard node types
const nodeTypes: NodeTypes = {
  start: StartNode,
  end: EndNode,
  process: ProcessNode,
  decision: DecisionNode,
  document: DocumentNode,
  delay: DelayNode,
};

// Header component for process management
function ProcessHeader({
  processName,
  onProcessNameChange,
  onSave,
  onExport,
}: {
  processName: string;
  onProcessNameChange: (name: string) => void;
  onSave: () => void;
  onExport: () => void;
}) {
  return (
    <div className="bg-background flex h-16 items-center justify-between border-b px-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-semibold">Process Designer</h1>
        <div className="flex items-center space-x-2">
          <Label className="text-sm font-medium" htmlFor="process-name">
            Process Name:
          </Label>
          <Input
            className="w-48"
            id="process-name"
            onChange={(e) => onProcessNameChange(e.target.value)}
            placeholder="Enter process name..."
            value={processName}
          />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          className="flex items-center space-x-2"
          onClick={onExport}
          size="sm"
          variant="outline"
        >
          <Download className="h-4 w-4" />
          <span>Export</span>
        </Button>
        <Button
          className="flex items-center space-x-2"
          onClick={onSave}
          size="sm"
        >
          <Save className="h-4 w-4" />
          <span>Save Process</span>
        </Button>
      </div>
    </div>
  );
}

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

export default function ProcessDesigner() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [processName, setProcessName] = useState<string>("Untitled Process");

  // Load process from URL parameter or localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const loadProcessName = urlParams.get("load");

    if (loadProcessName) {
      try {
        const savedProcess = localStorage.getItem("savedProcess");
        if (savedProcess) {
          const processData = JSON.parse(savedProcess) as ProcessData;
          if (processData.name === decodeURIComponent(loadProcessName)) {
            setNodes(processData.nodes as Node[]);
            setEdges(processData.edges as Edge[]);
            setProcessName(processData.name);
          }
        }
      } catch {
        return;
      }
    }
  }, [setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds: Edge[]) => addEdge(params, eds)),
    [setEdges],
  );

  const onNodeClick = useCallback((_event: unknown, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const addNode = useCallback(
    (type: string, label: string) => {
      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position: { x: Math.random() * 400, y: Math.random() * 400 },
        data: { label },
      };
      setNodes((nds: Node[]) => [...nds, newNode]);
    },
    [setNodes],
  );

  const updateNode = useCallback(
    (
      nodeId: string,
      updates: Partial<Node["data"]> & { position?: { x: number; y: number } },
    ) => {
      setNodes((nds: Node[]) =>
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
    [setNodes],
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds: Node[]) => nds.filter((node: Node) => node.id !== nodeId));
      setEdges((eds: Edge[]) =>
        eds.filter(
          (edge: Edge) => edge.source !== nodeId && edge.target !== nodeId,
        ),
      );
      setSelectedNode(null);
    },
    [setNodes, setEdges],
  );

  const handleSave = useCallback(() => {
    const processData = {
      name: processName,
      nodes,
      edges,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to localStorage for now (can be replaced with API call)
    localStorage.setItem("savedProcess", JSON.stringify(processData));

    // Show success message (you can replace this with a toast notification)
    alert(`Process "${processName}" saved successfully!`);
  }, [processName, nodes, edges]);

  const handleExport = useCallback(() => {
    const processData = {
      name: processName,
      nodes,
      edges,
      exportedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(processData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${processName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [processName, nodes, edges]);

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <ProcessHeader
        onExport={handleExport}
        onProcessNameChange={setProcessName}
        onSave={handleSave}
        processName={processName}
      />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - Node palette */}
        <div className="bg-background w-72 overflow-y-auto border-r p-4">
          <NodePalette onAddNode={addNode} />
        </div>

        {/* Center - Process canvas */}
        <div className="flex-1">
          <ReactFlow
            edges={edges}
            fitView
            nodes={nodes}
            nodeTypes={nodeTypes}
            onConnect={onConnect}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onNodesChange={onNodesChange}
            onPaneClick={onPaneClick}
          >
            <Controls />
            <Background />
            <MiniMap />
          </ReactFlow>
        </div>

        {/* Right sidebar - Properties panel (only visible when node is selected) */}
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
      </div>
    </div>
  );
}
