"use client";

import type { Edge, Node } from "@xyflow/react";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Background, ReactFlow } from "@xyflow/react";
import {
  Calendar,
  Database,
  Edit,
  Eye,
  FileText,
  Plus,
  Search,
  Share2,
  Trash2,
} from "lucide-react";
import { useTheme } from "next-themes";

import type { ProcessData } from "~/app/lib/process-utils";
import { getProcessOverview } from "~/app/lib/process-utils";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

import "@xyflow/react/dist/style.css";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { RouterOutputs } from "@acme/api";

import {
  DecisionNode,
  DelayNode,
  DocumentNode,
  EndNode,
  ProcessNode,
  StartNode,
} from "~/app/_components/flow-designer/nodes";
import { useTRPC } from "~/trpc/react";
import { ProcessCard, ProcessCardSkeleton } from "~/app/_components/process-card";
import { useBatchPermissions } from "~/hooks/usePermission";
import { authClient } from "~/auth/client";
import { createSolutionBuilderWithWatch } from "typescript";

type Process = RouterOutputs["process"]["getAll"][number];

// Node types for the mini process preview
const nodeTypes = {
  start: StartNode,
  end: EndNode,
  process: ProcessNode,
  decision: DecisionNode,
  document: DocumentNode,
  delay: DelayNode,
};

// Mock data for testing
const createMockProcesses = () => {
  const mockProcesses: ProcessData[] = [
    {
      name: "User Registration Process",
      description:
        "Complete user registration workflow with email verification",
      nodes: [
        {
          id: "start-1",
          type: "start",
          position: { x: 100, y: 100 },
          data: { label: "Start Registration" },
        },
        {
          id: "process-1",
          type: "process",
          position: { x: 300, y: 100 },
          data: { label: "Collect User Info" },
        },
        {
          id: "decision-1",
          type: "decision",
          position: { x: 500, y: 100 },
          data: { label: "Email Valid?" },
        },
        {
          id: "process-2",
          type: "process",
          position: { x: 700, y: 50 },
          data: { label: "Send Verification" },
        },
        {
          id: "delay-1",
          type: "delay",
          position: { x: 700, y: 150 },
          data: { label: "Wait for Response" },
        },
        {
          id: "end-1",
          type: "end",
          position: { x: 900, y: 100 },
          data: { label: "Registration Complete" },
        },
      ],
      edges: [
        { id: "e1-2", source: "start-1", target: "process-1" },
        { id: "e2-3", source: "process-1", target: "decision-1" },
        { id: "e3-4", source: "decision-1", target: "process-2" },
        { id: "e3-5", source: "decision-1", target: "delay-1" },
        { id: "e4-6", source: "process-2", target: "end-1" },
        { id: "e5-6", source: "delay-1", target: "end-1" },
      ],
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-20T14:45:00Z",
    },
    {
      name: "Order Processing System",
      description: "E-commerce order processing and fulfillment workflow",
      nodes: [
        {
          id: "start-2",
          type: "start",
          position: { x: 100, y: 100 },
          data: { label: "Order Received" },
        },
        {
          id: "process-3",
          type: "process",
          position: { x: 300, y: 100 },
          data: { label: "Validate Order" },
        },
        {
          id: "decision-2",
          type: "decision",
          position: { x: 500, y: 100 },
          data: { label: "Payment OK?" },
        },
        {
          id: "process-4",
          type: "process",
          position: { x: 700, y: 50 },
          data: { label: "Process Payment" },
        },
        {
          id: "document-1",
          type: "document",
          position: { x: 700, y: 150 },
          data: { label: "Generate Invoice" },
        },
        {
          id: "process-5",
          type: "process",
          position: { x: 900, y: 100 },
          data: { label: "Ship Order" },
        },
        {
          id: "end-2",
          type: "end",
          position: { x: 1100, y: 100 },
          data: { label: "Order Complete" },
        },
      ],
      edges: [
        { id: "e1-2", source: "start-2", target: "process-3" },
        { id: "e2-3", source: "process-3", target: "decision-2" },
        { id: "e3-4", source: "decision-2", target: "process-4" },
        { id: "e3-5", source: "decision-2", target: "document-1" },
        { id: "e4-6", source: "process-4", target: "process-5" },
        { id: "e5-6", source: "document-1", target: "process-5" },
        { id: "e6-7", source: "process-5", target: "end-2" },
      ],
      createdAt: "2024-01-10T09:15:00Z",
      updatedAt: "2024-01-18T16:20:00Z",
    },
    {
      name: "Customer Support Ticket",
      description: "Simple customer support ticket resolution process",
      nodes: [
        {
          id: "start-3",
          type: "start",
          position: { x: 100, y: 100 },
          data: { label: "Ticket Created" },
        },
        {
          id: "process-6",
          type: "process",
          position: { x: 300, y: 100 },
          data: { label: "Assign Agent" },
        },
        {
          id: "process-7",
          type: "process",
          position: { x: 500, y: 100 },
          data: { label: "Investigate Issue" },
        },
        {
          id: "decision-3",
          type: "decision",
          position: { x: 700, y: 100 },
          data: { label: "Issue Resolved?" },
        },
        {
          id: "end-3",
          type: "end",
          position: { x: 900, y: 100 },
          data: { label: "Ticket Closed" },
        },
      ],
      edges: [
        { id: "e1-2", source: "start-3", target: "process-6" },
        { id: "e2-3", source: "process-6", target: "process-7" },
        { id: "e3-4", source: "process-7", target: "decision-3" },
        { id: "e4-5", source: "decision-3", target: "end-3" },
      ],
      createdAt: "2024-01-25T11:00:00Z",
      updatedAt: "2024-01-25T11:00:00Z",
    },
  ];

  // Save mock processes to localStorage
  mockProcesses.forEach((process, index) => {
    const processKey = `process_${process.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${Date.now() + index}`;
    localStorage.setItem(processKey, JSON.stringify(process));
  });

  // Also save the first process to the legacy key
  localStorage.setItem("savedProcess", JSON.stringify(mockProcesses[0]));

  return mockProcesses;
};

export default function ProcessesPage() {
  const trpc = useTRPC();

  const [searchTerm, setSearchTerm] = useState("");
  // Fetch processes from backend
  const {
    data: processes,
    isLoading,
    isError,
  } = useQuery(trpc.process.getAll.queryOptions());
  const [filteredProcesses, setFilteredProcesses] = useState<Process[]>([]);

  useEffect(() => {
    const filtered = processes?.filter(
      (process: Process) =>
        process.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        process.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredProcesses(filtered ?? []);
  }, [processes, searchTerm]);

  const { data: session } = authClient.useSession();
  const userId = session?.user.id;

  // Memoize the permissions array to prevent unnecessary re-renders
  const permissionKeys = useMemo(() =>
    processes?.map((item) => `process:${item.id}`) ?? [],
    [processes]
  );

  // Memoize userId to prevent unnecessary re-renders
  const memoizedUserId = useMemo(() => userId ?? "", [userId]);

  // Only call useBatchPermissions when we have a valid userId and processes
  const { data: permissionMap, isLoading: isLoadingPermissions } = useBatchPermissions(
    memoizedUserId,
    permissionKeys
  );
  console.log("test")
  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Processes</h1>
          <p className="text-muted-foreground">
            Manage and view your saved process designs
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            className="flex items-center space-x-2"
            onClick={() => {
              createMockProcesses();
              // loadProcessesFromStorage(); // This line is removed as per the edit hint
            }}
            variant="outline"
          >
            <Database className="h-4 w-4" />
            <span>Load Sample Data</span>
          </Button>
          <Link href="/plan/process-designer">
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create New Process</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative max-w-md flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
          <Input
            className="pl-10"
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search processes..."
            value={searchTerm}
          />
        </div>
        <Badge variant="secondary">
          {filteredProcesses.length} process
          {filteredProcesses.length !== 1 ? "es" : ""}
        </Badge>
      </div>

      {/* Processes Grid */}
      {isLoading ? (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <FileText className="text-muted-foreground mx-auto h-12 w-12" />
            <div>
              <h3 className="text-lg font-semibold">Loading processes...</h3>
              <p className="text-muted-foreground">
                Please wait while we fetch the process data.
              </p>
            </div>
          </div>
        </Card>
      ) : isError ? (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <FileText className="text-muted-foreground mx-auto h-12 w-12" />
            <div>
              <h3 className="text-lg font-semibold">Error loading processes</h3>
              <p className="text-muted-foreground">
                Failed to fetch process data from the backend.
              </p>
            </div>
          </div>
        </Card>
      ) : filteredProcesses.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <FileText className="text-muted-foreground mx-auto h-12 w-12" />
            <div>
              <h3 className="text-lg font-semibold">No processes found</h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Try adjusting your search terms."
                  : "Create your first process to get started."}
              </p>
            </div>
            {!searchTerm && (
              <Link href="/plan/process-designer">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Process
                </Button>
              </Link>
            )}
          </div>
        </Card>
      ) : isLoadingPermissions ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProcesses.map((process: Process) => {
            return <ProcessCardSkeleton key={process.id} />;
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProcesses.map((process: Process, index: number) => {
            const perms = permissionMap?.[`process:${process.id}`];
            // Use flowData for nodes/edges preview if available
            const flowData = process.flowData as {
              nodes?: Node[];
              edges?: Edge[];
            };
            const nodes = flowData.nodes ?? [];
            const edges = flowData.edges ?? [];
            const overview = getProcessOverview({
              name: process.name,
              description: process.description,
              nodes,
              edges,
              createdAt: process.createdAt.toISOString(),
              updatedAt: process.updatedAt.toISOString(),
            });

            return (
              <ProcessCard
                key={process.id}
                process={process}
                permissions={perms}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
