"use client";

import type { Edge, Node } from "@xyflow/react";
import { useEffect, useState, useRef } from "react";
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
  ChevronDown,
  ChevronRight,
  Clock,
  User,
  Tag,
} from "lucide-react";
import { useTheme } from "next-themes";

import type { ProcessData } from "~/app/lib/process-utils";
import { getProcessOverview } from "~/app/lib/process-utils";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "~/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "~/components/ui/dialog";

import "@xyflow/react/dist/style.css";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
import { ProcessCard } from "~/app/_components/process-card";
import { ProjectCard } from "~/app/_components/project-card";
import { DatePickerWithInput } from "~/components/ui/datepicker-with-input";
import { Textarea } from "~/components/ui/textarea";

type Project = RouterOutputs["project"]["getAll"][number] & { priority?: string };

// Node types for the mini process preview
const nodeTypes = {
  start: StartNode,
  end: EndNode,
  process: ProcessNode,
  decision: DecisionNode,
  document: DocumentNode,
  delay: DelayNode,
};

export default function ProjectsPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  // Fetch projects from backend
  const projects = useQuery(trpc.project.getAll.queryOptions());
  const processCreate = useMutation(trpc.project.create.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.project.getAll.queryOptions());
      setIsModalOpen(false);
      setDialogStep(1);
      setSelectedProcessId(null);
      setProjectMetadata({ name: "", description: "", priority: "Medium" });
    },
  }));
  const process = useQuery(trpc.process.getAll.queryOptions());
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);
  const [dialogStep, setDialogStep] = useState(1);
  const [projectMetadata, setProjectMetadata] = useState({ name: "", description: "", priority: "Medium" });
  const [taskAssignments, setTaskAssignments] = useState<Record<string, string>>({});
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  useEffect(() => {
    const filtered = projects.data?.filter(
      (project: Project) =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredProjects(filtered ?? []);
  }, [projects.data, searchTerm]);

  // Reset dialog state when modal closes
  useEffect(() => {
    if (!isModalOpen) {
      setDialogStep(1);
      setSelectedProcessId(null);
      setProjectMetadata({ name: "", description: "", priority: "Medium" });
      setTaskAssignments({});
      setExpandedTasks(new Set());
    }
  }, [isModalOpen]);

  const handleNextStep = () => {
    if (selectedProcessId) {
      setDialogStep(2);
    }
  };

  const handleBackStep = () => {
    setDialogStep(1);
  };

  const handleNextToAssignments = () => {
    if (projectMetadata.name.trim()) {
      setDialogStep(3);
    }
  };

  const handleBackToMetadata = () => {
    setDialogStep(2);
  };

  const handleCreateProject = () => {
    if (selectedProcessId && projectMetadata.name.trim()) {
      processCreate.mutate({
        processId: selectedProcessId,
        name: projectMetadata.name,
        description: projectMetadata.description,
        priority: projectMetadata.priority,
      });
    }
  };

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  // Get the selected process to extract tasks for assignment
  const selectedProcess = process.data?.find(p => p.id === selectedProcessId);
  const processTasks = (selectedProcess?.flowData as any)?.nodes || [];

  // Get users for assignment
  const users = useQuery(trpc.user.getAll.queryOptions());

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Manage and view your saved project designs
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create New Project</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogTitle>
                {dialogStep === 1 ? "Select a Process" :
                  dialogStep === 2 ? "Project Details" : "Assign Users to Tasks"}
              </DialogTitle>

              {dialogStep === 1 ? (
                // Step 1: Process Selection
                <div className="space-y-4">
                  {process.data?.length === 0 ? (
                    <div className="text-muted-foreground">No processes available.</div>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor="process-select">Select a Process</Label>
                        <Select
                          value={selectedProcessId ?? ""}
                          onValueChange={val => setSelectedProcessId(val || null)}
                        >
                          <SelectTrigger className="w-full mt-2">
                            <SelectValue placeholder="-- Select a process --" />
                          </SelectTrigger>
                          <SelectContent>
                            {process.data?.map(project => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedProcessId && (
                        <div className="mt-4">
                          <Label>Process Preview</Label>
                          <div className="mt-2">
                            <ProcessCard
                              project={process.data?.find(p => p.id === selectedProcessId)!}
                              isPreview
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : dialogStep === 2 ? (
                // Step 2: Project Metadata
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="project-name">Project Name *</Label>
                    <Input
                      id="project-name"
                      className="mt-2"
                      placeholder="Enter project name"
                      value={projectMetadata.name}
                      onChange={(e) => setProjectMetadata(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div>
                    <DatePickerWithInput label="Project Start Date" />
                  </div>

                  <div>
                    <Label htmlFor="project-priority">Priority</Label>
                    <Select
                      value={projectMetadata.priority}
                      onValueChange={val => setProjectMetadata(prev => ({ ...prev, priority: val }))}
                    >
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Critical">
                          <span className="inline-block w-2 h-2 rounded-full bg-purple-600 mr-2 align-middle" />
                          Critical
                        </SelectItem>
                        <SelectItem value="High">
                          <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2 align-middle" />
                          High
                        </SelectItem>

                        <SelectItem value="Medium">
                          <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-2 align-middle" />
                          Medium
                        </SelectItem>
                        <SelectItem value="Low">
                          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2 align-middle" />
                          Low
                        </SelectItem>

                        <SelectItem value="Lowest">
                          <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mr-2 align-middle" />
                          Lowest
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="project-description">Description</Label>
                    <Textarea
                      id="project-description"
                      className="mt-2"
                      placeholder="Enter project description (optional)"
                      value={projectMetadata.description}
                      onChange={(e) => setProjectMetadata(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                </div>
              ) : (
                // Step 3: Task Assignments
                <div className="space-y-4">
                  <div>
                    <Label>Assign Users to Tasks</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Assign team members to specific tasks in your project
                    </p>
                  </div>

                  {processTasks.length === 0 ? (
                    <div className="text-muted-foreground text-center py-4">
                      No tasks found in the selected process.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {processTasks.map((task: any) => {
                        const isExpanded = expandedTasks.has(task.id);
                        return (
                          <div key={task.id} className="border rounded-lg overflow-hidden">
                            {/* Task Header */}
                            <div className="flex items-center justify-between p-3 bg-muted/50">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => toggleTaskExpansion(task.id)}
                                  className="p-1 hover:bg-muted rounded transition-colors"
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </button>
                                <div className="flex-1">
                                  <Label className="text-sm font-medium">
                                    {task.data?.label || task.type}
                                  </Label>
                                  <p className="text-xs text-muted-foreground">{task.type}</p>
                                </div>
                              </div>
                              <Select
                                value={taskAssignments[task.id] || "0"}
                                onValueChange={(value) =>
                                  setTaskAssignments(prev => ({
                                    ...prev,
                                    [task.id]: value
                                  }))
                                }
                              >
                                <SelectTrigger className="w-48">
                                  <SelectValue placeholder="Unassigned" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">Unassigned</SelectItem>
                                  {users.data?.map(user => (
                                    <SelectItem key={user.id} value={user.id}>
                                      {user.name || user.email}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Collapsible Task Details */}
                            {isExpanded && (
                              <div className="p-3 border-t bg-background">
                                <div className="space-y-3">
                                  {/* Task Description */}
                                  <div>
                                    <Label className="text-xs font-medium text-muted-foreground">
                                      Description
                                    </Label>
                                    <p className="text-sm mt-1">
                                      {task.data?.description || "No description available"}
                                    </p>
                                  </div>

                                  {/* Task Position */}
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                        <Tag className="h-3 w-3" />
                                        Position
                                      </Label>
                                      <p className="text-sm mt-1">
                                        X: {task.position?.x?.toFixed(0) || "N/A"},
                                        Y: {task.position?.y?.toFixed(0) || "N/A"}
                                      </p>
                                    </div>
                                    <div>
                                      <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        Type
                                      </Label>
                                      <p className="text-sm mt-1 capitalize">
                                        {task.type}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Task Data */}
                                  {task.data && Object.keys(task.data).length > 0 && (
                                    <div>
                                      <Label className="text-xs font-medium text-muted-foreground">
                                        Task Data
                                      </Label>
                                      <div className="mt-1 p-2 bg-muted rounded text-xs font-mono">
                                        <pre className="whitespace-pre-wrap">
                                          {JSON.stringify(task.data, null, 2)}
                                        </pre>
                                      </div>
                                    </div>
                                  )}

                                  {/* Assigned User Info */}
                                  {taskAssignments[task.id] && taskAssignments[task.id] !== "0" && (
                                    <div>
                                      <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        Assigned To
                                      </Label>
                                      <p className="text-sm mt-1">
                                        {users.data?.find(u => u.id === taskAssignments[task.id])?.name ||
                                          users.data?.find(u => u.id === taskAssignments[task.id])?.email ||
                                          "Unknown User"}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <DialogFooter>
                {dialogStep === 1 ? (
                  <>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                      onClick={handleNextStep}
                      disabled={!selectedProcessId}
                    >
                      Next
                    </Button>
                  </>
                ) : dialogStep === 2 ? (
                  <>
                    <Button variant="outline" onClick={handleBackStep}>
                      Back
                    </Button>
                    <Button
                      onClick={handleNextToAssignments}
                      disabled={!projectMetadata.name.trim()}
                    >
                      Next
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={handleBackToMetadata}>
                      Back
                    </Button>
                    <Button
                      onClick={handleCreateProject}
                      disabled={processCreate.isPending}
                    >
                      {processCreate.isPending ? "Creating..." : "Create Project"}
                    </Button>
                  </>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative max-w-md flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
          <Input
            className="pl-10"
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects..."
            value={searchTerm}
          />
        </div>
        <Badge variant="secondary">
          {filteredProjects.length} project
          {filteredProjects.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Projects Grid */}
      {projects.isLoading ? (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <FileText className="text-muted-foreground mx-auto h-12 w-12" />
            <div>
              <h3 className="text-lg font-semibold">Loading projects...</h3>
              <p className="text-muted-foreground">
                Please wait while we fetch the project data.
              </p>
            </div>
          </div>
        </Card>
      ) : projects.isError ? (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <FileText className="text-muted-foreground mx-auto h-12 w-12" />
            <div>
              <h3 className="text-lg font-semibold">Error loading projects</h3>
              <p className="text-muted-foreground">
                Failed to fetch project data from the backend.
              </p>
            </div>
          </div>
        </Card>
      ) : filteredProjects.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <FileText className="text-muted-foreground mx-auto h-12 w-12" />
            <div>
              <h3 className="text-lg font-semibold">No projects found</h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Try adjusting your search terms."
                  : "Create your first project to get started."}
              </p>
            </div>
            {!searchTerm && (
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Project
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project: Project, index: number) => (
            <ProjectCard
              key={project.id}
              project={project}
            />
          ))}
        </div>
      )}
    </div>
  );
}
