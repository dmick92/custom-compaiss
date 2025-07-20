"use client";

import { Background, type Edge, type Node, ReactFlow } from "@xyflow/react";
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
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { getProcessOverview, type ProcessData } from "~/app/lib/process-utils";
import "@xyflow/react/dist/style.css";
import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	DecisionNode,
	DelayNode,
	DocumentNode,
	EndNode,
	ProcessNode,
	StartNode,
} from "~/app/_components/flow-designer/nodes";
import { useTRPC } from "~/trpc/react";
import { RouterOutputs } from "@acme/api";

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
	const queryClient = useQueryClient();

	const { theme } = useTheme();
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
				process.description?.toLowerCase().includes(searchTerm.toLowerCase())
		);
		setFilteredProcesses(filtered || []);
	}, [processes, searchTerm]);

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<div className="container mx-auto space-y-6 p-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl">Processes</h1>
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
					<Link href="/process-designer">
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
					<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
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
						<FileText className="mx-auto h-12 w-12 text-muted-foreground" />
						<div>
							<h3 className="font-semibold text-lg">Loading processes...</h3>
							<p className="text-muted-foreground">
								Please wait while we fetch the process data.
							</p>
						</div>
					</div>
				</Card>
			) : isError ? (
				<Card className="p-12 text-center">
					<div className="space-y-4">
						<FileText className="mx-auto h-12 w-12 text-muted-foreground" />
						<div>
							<h3 className="font-semibold text-lg">Error loading processes</h3>
							<p className="text-muted-foreground">
								Failed to fetch process data from the backend.
							</p>
						</div>
					</div>
				</Card>
			) : filteredProcesses.length === 0 ? (
				<Card className="p-12 text-center">
					<div className="space-y-4">
						<FileText className="mx-auto h-12 w-12 text-muted-foreground" />
						<div>
							<h3 className="font-semibold text-lg">No processes found</h3>
							<p className="text-muted-foreground">
								{searchTerm
									? "Try adjusting your search terms."
									: "Create your first process to get started."}
							</p>
						</div>
						{!searchTerm && (
							<Link href="/process-designer">
								<Button>
									<Plus className="mr-2 h-4 w-4" />
									Create Your First Process
								</Button>
							</Link>
						)}
					</div>
				</Card>
			) : (
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{filteredProcesses?.map((process: Process, index: number) => {
						// Use flowData for nodes/edges preview if available
						const flowData = process.flowData as unknown as {
							nodes?: Node[];
							edges?: Edge[];
						};
						const nodes = flowData?.nodes || [];
						const edges = flowData?.edges || [];
						if (!(nodes && edges)) {
							return null; // skip invalid
						}
						const overview = getProcessOverview({
							name: process.name,
							description: process.description,
							nodes,
							edges,
							createdAt: process.createdAt.toISOString(),
							updatedAt: process.updatedAt.toISOString(),
						});

						return (
							<Card className="transition-shadow hover:shadow-lg" key={index}>
								<CardHeader>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<CardTitle className="text-lg">{process.name}</CardTitle>
											<p className="mt-1 text-muted-foreground text-sm">
												{process.description || "No description provided"}
											</p>
										</div>
										<Badge
											variant={
												overview.complexity === "High"
													? "destructive"
													: overview.complexity === "Medium"
														? "default"
														: "secondary"
											}
										>
											{overview.complexity}
										</Badge>
									</div>
								</CardHeader>
								<CardContent className="space-y-4">
									{/* Process Overview */}
									<div className="space-y-3">
										<div className="flex items-center justify-between text-sm">
											<span className="text-muted-foreground">Nodes:</span>
											<span className="font-medium">{overview.nodeCount}</span>
										</div>
										<div className="flex items-center justify-between text-sm">
											<span className="text-muted-foreground">
												Connections:
											</span>
											<span className="font-medium">{overview.edgeCount}</span>
										</div>
										<div className="flex items-center justify-between text-sm">
											<span className="text-muted-foreground">Node Types:</span>
											<div className="flex gap-1">
												{overview.nodeTypes
													.slice(0, 3)
													.map((type: string, i: number) => (
														<Badge
															className="text-xs"
															key={i}
															variant="outline"
														>
															{type}
														</Badge>
													))}
												{overview.nodeTypes.length > 3 && (
													<Badge className="text-xs" variant="outline">
														+{overview.nodeTypes.length - 3}
													</Badge>
												)}
											</div>
										</div>
									</div>

									{/* XYFlow Data Preview */}
									<div className="space-y-2">
										<Label className="font-medium text-sm">
											Process Preview
										</Label>
										<div className="h-48 overflow-hidden rounded-md border">
											<ReactFlow
												className={theme === "dark" ? "dark" : ""}
												defaultEdgeOptions={{
													animated: true,
													style: { stroke: "#6366f1", strokeWidth: 2 },
												}}
												edges={edges.map((edge: Edge) => ({
													id: edge.id,
													source: edge.source,
													target: edge.target,
													type: "smoothstep",
													style: { stroke: "#6366f1", strokeWidth: 2 },
												}))}
												elementsSelectable={false}
												fitView
												fitViewOptions={{ padding: 0.1 }}
												maxZoom={1.5}
												minZoom={0.5}
												nodes={nodes.map((node: Node) => ({
													id: node.id,
													type: node.type,
													position: node.position,
													data: node.data,
												}))}
												nodesConnectable={false}
												nodesDraggable={false}
												nodeTypes={nodeTypes}
												panOnDrag={false}
												panOnScroll={false}
												preventScrolling={false}
												proOptions={{ hideAttribution: true }}
												zoomOnPinch={true}
												zoomOnScroll={true}
											>
												{/* <Controls showInteractive={false} /> */}
												<Background />
											</ReactFlow>
										</div>
									</div>

									{/* Timestamps */}
									<div className="space-y-2 text-muted-foreground text-xs">
										<div className="flex items-center space-x-2">
											<Calendar className="h-3 w-3" />
											<span>Created: {formatDate(process.createdAt.toISOString())}</span>
										</div>
										<div className="flex items-center space-x-2">
											<Calendar className="h-3 w-3" />
											<span>Updated: {formatDate(process.updatedAt.toISOString())}</span>
										</div>
									</div>

									{/* Actions */}
									<div className="flex items-center space-x-2 pt-2">
										<Link
											href={`/process-designer?process=${encodeURIComponent(process.id)}`}
											onMouseEnter={() => {
												queryClient.prefetchQuery(
													trpc.process.getById.queryOptions(
														{ id: process.id },
													)
												);
											}}
											onFocus={() => {
												queryClient.prefetchQuery(
													trpc.process.getById.queryOptions(
														{ id: process.id },
													)
												);
											}}
										>
											<Button className="flex-1" size="sm" variant="outline">
												<Edit className="mr-1 h-3 w-3" />
												Edit
											</Button>
										</Link>
										<Button size="sm" variant="outline">
											<Eye className="mr-1 h-3 w-3" />
											View
										</Button>
										<Button size="sm" variant="outline">
											<Share2 className="mr-1 h-3 w-3" />
											Share
										</Button>
										<Button
											className="text-destructive hover:text-destructive"
											onClick={() => {
												alert(
													"Delete functionality is not yet implemented via TRPC."
												);
											}}
											size="sm"
											variant="outline"
										>
											<Trash2 className="h-3 w-3" />
										</Button>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}
		</div>
	);
}
