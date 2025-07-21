import { Background, ReactFlow } from "@xyflow/react";
import { Calendar, Edit, Eye, Loader2, Share2, Trash2 } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import type { Edge, Node } from "@xyflow/react";
import { getProcessOverview } from "~/app/lib/process-utils";
import type { RouterOutputs } from "@acme/api";
import { useTheme } from "next-themes";
import {
    DecisionNode,
    DelayNode,
    DocumentNode,
    EndNode,
    ProcessNode,
    StartNode,
} from "./flow-designer/nodes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import "@xyflow/react/dist/style.css";
import { PriorityBadge } from "./priority";


const nodeTypes = {
    start: StartNode,
    end: EndNode,
    process: ProcessNode,
    decision: DecisionNode,
    document: DocumentNode,
    delay: DelayNode,
};

export function ProjectCard({
    project,
    isPreview = false,
}: {
    project: RouterOutputs["project"]["getAll"][number];
    isPreview?: boolean;
}) {
    const queryClient = useQueryClient();
    const trpc = useTRPC();

    const projectDelete = useMutation(trpc.project.delete.mutationOptions({
        onSuccess: () => {
            queryClient.invalidateQueries(trpc.project.getAll.queryOptions());
        },
    }));

    const { theme } = useTheme();
    const flowData = project.flowData as { nodes?: Node[]; edges?: Edge[] };
    const nodes = flowData.nodes ?? [];
    const edges = flowData.edges ?? [];
    const overview = getProcessOverview({
        name: project.name,
        description: project.description,
        nodes,
        edges,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
    });
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
        <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <p className="text-muted-foreground mt-1 text-sm">
                            {project.description ?? "No description provided"}
                        </p>
                    </div>
                    <PriorityBadge priority={project.priority} />
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Project Overview */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Nodes:</span>
                        <span className="font-medium">{overview.nodeCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Connections:</span>
                        <span className="font-medium">{overview.edgeCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Node Types:</span>
                        <div className="flex gap-1">
                            {overview.nodeTypes.slice(0, 3).map((type: string, i: number) => (
                                <Badge className="text-xs" key={i} variant="outline">
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
                    <Label className="text-sm font-medium">Project Preview</Label>
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
                <div className="text-muted-foreground space-y-2 text-xs">
                    <div className="flex items-center space-x-2">
                        <Calendar className="h-3 w-3" />
                        <span>Created: {formatDate(project.createdAt.toISOString())}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Calendar className="h-3 w-3" />
                        <span>Updated: {formatDate(project.updatedAt.toISOString())}</span>
                    </div>
                </div>
                {/* Actions */}
                {!isPreview && (
                    <div className="flex items-center space-x-2 pt-2">
                        <Button size="sm" variant="outline">
                            <Edit className="mr-1 h-3 w-3" />
                            Edit
                        </Button>
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
                            disabled={projectDelete.isPending}
                            onClick={() => {
                                projectDelete.mutate({ id: project.id });
                            }}
                            size="sm"
                            variant="outline"
                        >
                            {projectDelete.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 