"use client";

import React from "react";
import { Button } from "@acme/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@acme/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@acme/ui/dialog";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
import { AvatarGroup } from "@acme/ui/avatar-group";
import { Separator } from "@acme/ui/separator";
import { Badge } from "@acme/ui/badge";
import { ScrollArea } from "@acme/ui/scroll-area";
import { Textarea } from "@acme/ui/textarea";
import { Skeleton } from "@acme/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@acme/ui/select";
import { MoreHorizontal, Plus, Trash2, Pencil, Users } from "lucide-react";
import { useTRPC } from "~/trpc/react";
import { useMutation, useQuery } from "@tanstack/react-query";
// trpc client hook from local app

type Team = {
    id: string;
    name: string;
    description?: string;
    members: Array<{
        id: string;
        name: string;
        email: string;
        avatarUrl?: string;
        role: "Owner" | "Admin" | "Member";
    }>;
};

function getInitials(name: string) {
    const parts = name.trim().split(" ").filter(Boolean);
    return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

// Role badge renderer for consistent styling
function RoleBadge({ role }: { role: "Owner" | "Admin" | "Member" }) {
    const colorByRole: Record<typeof role, string> = {
        Owner: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900",
        Admin: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
        Member: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-800",
    };
    // tighten vertical padding, keep compact horizontal spacing for pill-like look
    return <Badge variant="outline" className={`px-2 py-0.5 text-[11px] leading-5 ${colorByRole[role]}`}>{role}</Badge>;
}


export default function Page() {
    const trpc = useTRPC();


    // Dialog state
    const [isCreateOpen, setCreateOpen] = React.useState(false);
    const [isManageOpen, setManageOpen] = React.useState<{ open: boolean; team?: Team }>({ open: false });
    const [isEditOpen, setEditOpen] = React.useState<{ open: boolean; team?: Team }>({ open: false });
    const [isDeleteOpen, setDeleteOpen] = React.useState<{ open: boolean; team?: Team }>({ open: false });

    // Dialog-local staged members for Create/Edit
    const [createMembers, setCreateMembers] = React.useState<Team["members"]>([]);
    const [editMembers, setEditMembers] = React.useState<Team["members"]>([]);


    // Org users
    // const orgId = activeOrg?.orgId ?? "";
    const { data: orgUsers = [], isLoading: isUsersLoading } = useQuery(trpc.organization.members.queryOptions())

    // Teams list
    const { data: teams = [], isLoading, refetch } = useQuery(trpc.team.listByActiveOrg.queryOptions());



    // Mutations
    const createTeam = useMutation(useTRPC().team.create.mutationOptions({ onSuccess: () => refetch() }))
    const updateTeam = useMutation(useTRPC().team.update.mutationOptions({ onSuccess: () => refetch() }))
    const deleteTeam = useMutation(useTRPC().team.delete.mutationOptions({ onSuccess: () => refetch() }))
    const addMember = useMutation(useTRPC().team.addMember.mutationOptions({ onSuccess: () => refetch() }))
    const removeMember = useMutation(useTRPC().team.removeMember.mutationOptions({ onSuccess: () => refetch() }))
    const updateMemberRole = useMutation(useTRPC().team.updateMemberRole.mutationOptions({ onSuccess: () => refetch() }))

    async function handleCreateTeam(formData: FormData) {
        const name = String(formData.get("name") ?? "").trim();
        const description = String(formData.get("description") ?? "").trim();
        if (!name) return;

        // create team in active org, then add any staged members
        const res = await createTeam.mutateAsync({ name });
        if (createMembers.length > 0) {
            await Promise.all(
                createMembers.map((m) =>
                    addMember.mutateAsync({ teamId: res.id, userId: m.id, role: m.role }),
                ),
            );
        }

        setCreateMembers([]);
        setCreateOpen(false);
        await refetch();
    }

    async function handleEditTeam(teamId: string, formData: FormData) {
        const name = String(formData.get("name") ?? "").trim();
        const description = String(formData.get("description") ?? "").trim();
        if (!name) return;

        await updateTeam.mutateAsync({ id: teamId, name });

        // Sync members by diffing existing team vs editMembers:
        // For simplicity here: remove all members then add editMembers back
        // If you prefer granular diff, replace with a smarter reconciliation.
        const current = (((teams as unknown) as Team[]).find((t: Team) => t.id === teamId)?.members) ?? [];
        // removals
        await Promise.all(
            current
                .filter((cm: Team["members"][number]) => !editMembers.some((em) => em.id === cm.id))
                .map((cm: Team["members"][number]) => removeMember.mutateAsync({ teamId, userId: cm.id })),
        );
        // role updates and additions
        await Promise.all(
            editMembers.map(async (em: Team["members"][number]) => {
                const prev = current.find((cm: Team["members"][number]) => cm.id === em.id);
                if (!prev) {
                    await addMember.mutateAsync({ teamId, userId: em.id, role: em.role });
                } else if (prev.role !== em.role) {
                    await updateMemberRole.mutateAsync({ teamId, userId: em.id, role: em.role });
                }
            }),
        );

        setEditMembers([]);
        setEditOpen({ open: false, team: undefined });
        await refetch();
    }

    async function handleDeleteTeam(teamId: string) {
        await deleteTeam.mutateAsync({ id: teamId });
        setDeleteOpen({ open: false, team: undefined });
        await refetch();
    }

    async function handleAddMember(teamId: string, formData: FormData) {
        const userId = String(formData.get("memberUser") ?? "").trim();
        const role = (String(formData.get("memberRole") ?? "Member") as Team["members"][number]["role"]);
        if (!userId) return;
        await addMember.mutateAsync({ teamId, userId, role });
        await refetch();
    }

    async function handleUpdateMemberRole(teamId: string, memberId: string, role: Team["members"][number]["role"]) {
        await updateMemberRole.mutateAsync({ teamId, userId: memberId, role });
        await refetch();
    }

    async function handleRemoveMember(teamId: string, memberId: string) {
        await removeMember.mutateAsync({ teamId, userId: memberId });
        await refetch();
    }

    return (
        <div className="container mx-auto space-y-6 p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Teams</h1>
                    <p className="text-muted-foreground">Create teams, manage members, and control access.</p>
                </div>

                <Dialog
                    open={isCreateOpen}
                    onOpenChange={(open: boolean) => {
                        setCreateOpen(open);
                        if (!open) setCreateMembers([]);
                    }}
                >
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" /> Create team
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[760px]">
                        <DialogHeader>
                            <DialogTitle>Create a new team</DialogTitle>
                            <DialogDescription>Name your team, describe it, and add initial members with roles.</DialogDescription>
                        </DialogHeader>

                        <form
                            id="create-team-form"
                            action={(formData) => handleCreateTeam(formData)}
                            className="grid gap-6 py-2"
                        >
                            <div className="grid gap-2">
                                <Label htmlFor="name">Team name</Label>
                                <Input id="name" name="name" placeholder="e.g. Engineering" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" name="description" placeholder="What is this team responsible for?" />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium">Members</h4>
                                    <Badge variant="secondary" className="min-w-6 justify-center">{createMembers.length}</Badge>
                                </div>
                                <div className="space-y-2">
                                    {createMembers.length === 0 ? (
                                        <div className="text-sm text-muted-foreground">No members added yet.</div>
                                    ) : (
                                        createMembers.map((m) => (
                                            <div key={m.id} className="flex items-center gap-2 rounded-md border p-2">
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium truncate">{m.name}</div>
                                                    <div className="text-xs text-muted-foreground truncate">{m.email}</div>
                                                </div>
                                                <Select
                                                    value={m.role}
                                                    onValueChange={(val: string) => {
                                                        const role = val as Team["members"][number]["role"];
                                                        setCreateMembers((prev) =>
                                                            prev.map((x) => (x.id === m.id ? { ...x, role } : x)),
                                                        );
                                                    }}
                                                >
                                                    <SelectTrigger className="h-8 w-[132px]">
                                                        <SelectValue placeholder="Role" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Owner">Owner</SelectItem>
                                                        <SelectItem value="Admin">Admin</SelectItem>
                                                        <SelectItem value="Member">Member</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() =>
                                                        setCreateMembers((prev) => prev.filter((x) => x.id !== m.id))
                                                    }
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="grid gap-2 rounded-md border p-3">
                                    <div className="space-y-4 flex flex-row gap-2">
                                        {/* <Input name="cm-name" placeholder="Full name" />
                                        <Input name="cm-email" type="email" placeholder="email@company.com" /> */}
                                        <div className="grid gap-2 w-full">
                                            <Select name="memberUser" defaultValue="">
                                                <SelectTrigger className="h-9">
                                                    <SelectValue placeholder="Select user" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {(orgUsers as Array<{ user: { id: string; name: string; email: string }; member: { id: string; organizationId: string; userId: string; role: string; teamId: string | null; createdAt: Date } }>).map((u) => (
                                                        <SelectItem key={u.user.id} value={u.user.id}>
                                                            {u.user.name} — {u.user.email}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2 w-full">
                                            <Select name="cm-role" defaultValue="Member">
                                                <SelectTrigger className="h-9">
                                                    <SelectValue placeholder="Role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Owner">Owner</SelectItem>
                                                    <SelectItem value="Admin">Admin</SelectItem>
                                                    <SelectItem value="Member">Member</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) => {
                                                const form = (e.currentTarget as HTMLButtonElement).closest("form");
                                                if (!form) return;
                                                const userId = (form.elements.namedItem("memberUser") as HTMLInputElement)?.value;
                                                const role = (form.elements.namedItem("cm-role") as HTMLInputElement)?.value as Team["members"][number]["role"];
                                                if (!userId) return;
                                                const u = (orgUsers as Array<{ user: { id: string; name: string; email: string } }>).find(
                                                    (uu) => uu.user.id === userId,
                                                );
                                                if (!u) return;
                                                // prevent duplicates
                                                setCreateMembers((prev) =>
                                                    prev.some((m) => m.id === u.user.id)
                                                        ? prev
                                                        : [...prev, { id: u.user.id, name: u.user.name, email: u.user.email, role }],
                                                );
                                                const userEl = form.querySelector('[name="memberUser"]') as HTMLInputElement | null;
                                                const roleEl = form.querySelector('[name="cm-role"]') as HTMLInputElement | null;
                                                if (userEl) userEl.value = "";
                                                if (roleEl) roleEl.value = "Member";
                                            }}
                                        >
                                            Add member
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </form>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => { setCreateMembers([]); setCreateOpen(false); }}>Cancel</Button>
                            <Button type="submit" form="create-team-form">Create</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Separator className="mb-6" />

            {isLoading ? (
                <TeamListSkeleton />
            ) : teams.length === 0 ? (
                <EmptyState onCreate={() => setCreateOpen(true)} />
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {((teams as unknown) as Team[]).map((team: Team) => (
                        <Card key={team.id}>
                            <CardHeader className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            {team.name}
                                        </CardTitle>
                                        {team.description ? (
                                            <CardDescription>{team.description}</CardDescription>
                                        ) : (
                                            <CardDescription>No description</CardDescription>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Dialog
                                            open={isEditOpen.open && isEditOpen.team?.id === team.id}
                                            onOpenChange={(open: boolean) => {
                                                setEditOpen({ open, team: open ? team : undefined });
                                                if (open) {
                                                    // initialize dialog-local members from selected team
                                                    setEditMembers(team.members.map((m: Team["members"][number]) => ({ ...m })));
                                                } else {
                                                    setEditMembers([]);
                                                }
                                            }}
                                        >
                                            <DialogTrigger asChild>
                                                <Button size="icon" variant="ghost" aria-label="Edit team">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[760px]">
                                                <DialogHeader>
                                                    <DialogTitle>Edit team</DialogTitle>
                                                    <DialogDescription>Update team details and manage members with roles.</DialogDescription>
                                                </DialogHeader>
                                                <form
                                                    id={`edit-team-${team.id}`}
                                                    action={(fd) => handleEditTeam(team.id, fd)}
                                                    className="grid gap-6 py-2"
                                                >
                                                    <div className="grid gap-2">
                                                        <Label htmlFor={`name-${team.id}`}>Team name</Label>
                                                        <Input
                                                            id={`name-${team.id}`}
                                                            name="name"
                                                            defaultValue={team.name}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor={`desc-${team.id}`}>Description</Label>
                                                        <Textarea
                                                            id={`desc-${team.id}`}
                                                            name="description"
                                                            defaultValue={team.description}
                                                        />
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="text-sm font-medium">Members</h4>
                                                            <Badge variant="secondary" className="min-w-6 justify-center">{editMembers.length}</Badge>
                                                        </div>
                                                        <div className="space-y-2">
                                                            {editMembers.length === 0 ? (
                                                                <div className="text-sm text-muted-foreground">No members.</div>
                                                            ) : (
                                                                editMembers.map((m) => (
                                                                    <div key={m.id} className="flex items-center gap-2 rounded-md border p-2">
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="text-sm font-medium truncate">{m.name}</div>
                                                                            <div className="text-xs text-muted-foreground truncate">{m.email}</div>
                                                                        </div>
                                                                        <Select
                                                                            value={m.role}
                                                                            onValueChange={(val: string) => {
                                                                                const role = val as Team["members"][number]["role"];
                                                                                setEditMembers((prev) =>
                                                                                    prev.map((x) => (x.id === m.id ? { ...x, role } : x)),
                                                                                );
                                                                            }}
                                                                        >
                                                                            <SelectTrigger className="h-8 w-[132px]">
                                                                                <SelectValue placeholder="Role" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="Owner">Owner</SelectItem>
                                                                                <SelectItem value="Admin">Admin</SelectItem>
                                                                                <SelectItem value="Member">Member</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                        <Button
                                                                            type="button"
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            className="text-destructive hover:text-destructive"
                                                                            onClick={() =>
                                                                                setEditMembers((prev) => prev.filter((x) => x.id !== m.id))
                                                                            }
                                                                        >
                                                                            Remove
                                                                        </Button>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>

                                                        <div className="grid gap-2 rounded-md border p-3">
                                                            <div className="space-y-4 flex flex-row gap-2">
                                                                <div className="grid gap-2 w-full">
                                                                    <Select name="memberUser" defaultValue="">
                                                                        <SelectTrigger className="h-9">
                                                                            <SelectValue placeholder="Select user" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {(orgUsers as Array<{ user: { id: string; name: string; email: string } }>).map((u) => (
                                                                                <SelectItem key={u.user.id} value={u.user.id}>
                                                                                    {u.user.name} — {u.user.email}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                                <div className="grid gap-2 w-full">
                                                                    <Select name="em-role" defaultValue="Member">
                                                                        <SelectTrigger className="h-9">
                                                                            <SelectValue placeholder="Role" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="Owner">Owner</SelectItem>
                                                                            <SelectItem value="Admin">Admin</SelectItem>
                                                                            <SelectItem value="Member">Member</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-end">
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        const form = (e.currentTarget as HTMLButtonElement).closest("form");
                                                                        if (!form) return;
                                                                        const selectedUserId = (form.elements.namedItem("memberUser") as HTMLInputElement)?.value;
                                                                        const role = (form.elements.namedItem("em-role") as HTMLInputElement)?.value as Team["members"][number]["role"];
                                                                        if (!selectedUserId) return;
                                                                        const u = (orgUsers as Array<{ user: { id: string; name: string; email: string } }>).find((uu) => uu.user.id === selectedUserId);
                                                                        if (!u) return;
                                                                        setEditMembers((prev) =>
                                                                            prev.some((m) => m.id === u.user.id)
                                                                                ? prev
                                                                                : [...prev, { id: u.user.id, name: u.user.name, email: u.user.email, role }],
                                                                        );
                                                                        const userEl = form.querySelector('[name="memberUser"]') as HTMLInputElement | null;
                                                                        const roleEl = form.querySelector('[name="em-role"]') as HTMLInputElement | null;
                                                                        if (userEl) userEl.value = "";
                                                                        if (roleEl) roleEl.value = "Member";
                                                                    }}
                                                                >
                                                                    Add member
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </form>
                                                <DialogFooter>
                                                    <Button variant="outline" type="button" onClick={() => { setEditMembers([]); setEditOpen({ open: false }); }}>Cancel</Button>
                                                    <Button type="submit" form={`edit-team-${team.id}`}>Save</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>

                                        <Dialog
                                            open={isDeleteOpen.open && isDeleteOpen.team?.id === team.id}
                                            onOpenChange={(open) =>
                                                setDeleteOpen({ open, team: open ? team : undefined })
                                            }
                                        >
                                            <DialogTrigger asChild>
                                                <Button size="icon" variant="ghost" aria-label="Delete team">
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[480px]">
                                                <DialogHeader>
                                                    <DialogTitle>Delete team</DialogTitle>
                                                    <DialogDescription>
                                                        This action cannot be undone. This will permanently delete the team <strong>{team.name}</strong> and remove all of its members.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <DialogFooter>
                                                    <Button variant="outline" type="button" onClick={() => setDeleteOpen({ open: false })}>Cancel</Button>
                                                    <Button variant="destructive" onClick={() => handleDeleteTeam(team.id)}>Delete</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground">Members</div>
                                    <Badge variant="secondary" className="min-w-6 justify-center">{team.members.length}</Badge>
                                </div>

                                <div className="flex items-center justify-between">
                                    <AvatarGroup max={5}>
                                        {team.members.map((m: Team["members"][number]) => (
                                            <Avatar key={m.id} title={m.name}>
                                                {m.avatarUrl ? (
                                                    <AvatarImage src={m.avatarUrl} alt={m.name} />
                                                ) : (
                                                    <AvatarFallback>{getInitials(m.name).toUpperCase()}</AvatarFallback>
                                                )}
                                            </Avatar>
                                        ))}
                                    </AvatarGroup>

                                    <Dialog
                                        open={isManageOpen.open && isManageOpen.team?.id === team.id}
                                        onOpenChange={(open) =>
                                            setManageOpen({ open, team: open ? team : undefined })
                                        }
                                    >
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm">Manage members</Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[720px]">
                                            <DialogHeader>
                                                <DialogTitle>Manage members — {team.name}</DialogTitle>
                                                <DialogDescription>Add or remove members and set roles.</DialogDescription>
                                            </DialogHeader>

                                            <div className="flex flex-col gap-6">
                                                <div className="space-y-4">
                                                    <h4 className="text-sm font-medium">Add member</h4>
                                                    <form
                                                        className="space-y-4 flex flex-row gap-2"
                                                        onSubmit={(e) => {
                                                            e.preventDefault();
                                                            const form = e.currentTarget as HTMLFormElement;
                                                            const userId = (form.querySelector('[name="memberUser"]') as HTMLInputElement | null)?.value ?? "";
                                                            const role = ((form.querySelector('[name="memberRole"]') as HTMLInputElement | null)?.value ??
                                                                "Member") as Team["members"][number]["role"];
                                                            const selected = (orgUsers as Array<{ user: { id: string; name: string; email: string } }>).find((u) => u.user.id === userId);
                                                            if (!selected) return;
                                                            // persist immediately using trpc
                                                            addMember.mutate({ teamId: team.id, userId: selected.user.id, role });
                                                            // no local setTeams state exists anymore; rely on refetch in onSuccess
                                                            const userEl = form.querySelector('[name="memberUser"]') as HTMLInputElement | null;
                                                            const roleEl = form.querySelector('[name="memberRole"]') as HTMLInputElement | null;
                                                            if (userEl) userEl.value = "";
                                                            if (roleEl) roleEl.value = "Member";
                                                        }}
                                                    >
                                                        <div className="grid gap-2 w-full">
                                                            <Label>User</Label>
                                                            <Select name="memberUser" defaultValue="">
                                                                <SelectTrigger className="h-9">
                                                                    <SelectValue placeholder="Select user" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {(orgUsers as Array<{ user: { id: string; name: string; email: string } }>).map((u) => (
                                                                        <SelectItem key={u.user.id} value={u.user.id}>
                                                                            {u.user.name} — {u.user.email}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="grid gap-2 w-full">
                                                            <Label>Role</Label>
                                                            <Select name="memberRole" defaultValue="Member">
                                                                <SelectTrigger className="h-9">
                                                                    <SelectValue placeholder="Role" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="Owner">Owner</SelectItem>
                                                                    <SelectItem value="Admin">Admin</SelectItem>
                                                                    <SelectItem value="Member">Member</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="pt-5.5">
                                                            <Button type="submit" className="w-full">Add member</Button>
                                                        </div>
                                                    </form>
                                                </div>

                                                <div className="space-y-4">
                                                    <h4 className="text-sm font-medium">Current members</h4>
                                                    <ScrollArea className="h-64 rounded border p-2">
                                                        <ul className="space-y-2">
                                                            {team.members.length === 0 ? (
                                                                <li className="text-sm text-muted-foreground">No members yet.</li>
                                                            ) : (
                                                                team.members.map((m: Team["members"][number]) => (
                                                                    <li key={m.id} className="flex items-center justify-between gap-3 rounded-md border p-2">
                                                                        <div className="flex items-center gap-3">
                                                                            <Avatar className="h-8 w-8">
                                                                                {m.avatarUrl ? (
                                                                                    <AvatarImage src={m.avatarUrl} alt={m.name} />
                                                                                ) : (
                                                                                    <AvatarFallback>{getInitials(m.name).toUpperCase()}</AvatarFallback>
                                                                                )}
                                                                            </Avatar>
                                                                            <div className="leading-tight">
                                                                                <div className="text-sm font-medium">{m.name}</div>
                                                                                <div className="text-xs text-muted-foreground">{m.email}</div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <Select
                                                                                value={m.role}
                                                                                onValueChange={(val: string) =>
                                                                                    handleUpdateMemberRole(
                                                                                        team.id,
                                                                                        m.id,
                                                                                        val as Team["members"][number]["role"],
                                                                                    )
                                                                                }
                                                                            >
                                                                                <SelectTrigger className="h-8 w-[132px]">
                                                                                    <SelectValue placeholder="Role" />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    <SelectItem value="Owner">Owner</SelectItem>
                                                                                    <SelectItem value="Admin">Admin</SelectItem>
                                                                                    <SelectItem value="Member">Member</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="ghost"
                                                                                className="text-destructive hover:text-destructive"
                                                                                onClick={() => handleRemoveMember(team.id, m.id)}
                                                                            >
                                                                                Remove
                                                                            </Button>
                                                                        </div>
                                                                    </li>
                                                                ))
                                                            )}
                                                        </ul>
                                                    </ScrollArea>
                                                </div>
                                            </div>

                                            <DialogFooter className="mt-4">
                                                <Button type="button" variant="outline" onClick={() => setManageOpen({ open: false })}>Close</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardContent>

                            <CardFooter className="justify-end">
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <MoreHorizontal className="h-4 w-4" />
                                    More
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border p-12 text-center">
            <div className="mb-3 rounded-full bg-muted p-3">
                <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No teams yet</h3>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                Create your first team to organize people by function, project, or initiative.
            </p>
            <Button onClick={onCreate} className="gap-2">
                <Plus className="h-4 w-4" /> Create team
            </Button>
        </div>
    );
}

function TeamListSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="w-full space-y-2">
                                <Skeleton className="h-5 w-40" />
                                <Skeleton className="h-4 w-64" />
                            </div>
                            <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Skeleton className="h-4 w-24" />
                        <div className="flex items-center justify-between">
                            <div className="flex -space-x-2">
                                {Array.from({ length: 4 }).map((_, j) => (
                                    <Skeleton key={j} className="h-8 w-8 rounded-full border" />
                                ))}
                            </div>
                            <Skeleton className="h-9 w-32 rounded-md" />
                        </div>
                    </CardContent>
                    <CardFooter className="justify-end">
                        <Skeleton className="h-8 w-20 rounded-md" />
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}