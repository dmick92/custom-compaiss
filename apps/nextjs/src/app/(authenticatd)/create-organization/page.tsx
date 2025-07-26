"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { useTRPC } from "~/trpc/react";
import { useMutation } from "@tanstack/react-query";
import { authClient } from "~/auth/client";

function slugify(name: string) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/--+/g, "-");
}

export default function CreateOrganizationPage() {
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const router = useRouter();
    const trpc = useTRPC();

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setName(newName);
        if (!slugManuallyEdited) {
            setSlug(slugify(newName));
        }
    };

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSlug(e.target.value);
        setSlugManuallyEdited(true);
    };

    const handleSlugFocus = () => {
        setSlugManuallyEdited(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!name.trim() || !slug.trim()) {
            setError("Name and slug are required.");
            return;
        }
        setLoading(true);
        const org = await authClient.organization.create({
            name,
            slug,
            keepCurrentActiveOrganization: false,
        })

        setLoading(false);

    };

    return (
        <div className="flex items-center justify-center bg-background">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Create Organization</CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit} autoComplete="off">
                    <CardContent className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="org-name">Organization Name</Label>
                            <Input
                                id="org-name"
                                value={name}
                                onChange={handleNameChange}
                                placeholder="Acme Inc."
                                autoFocus
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="org-slug">Slug</Label>
                            <Input
                                id="org-slug"
                                value={slug}
                                onChange={handleSlugChange}
                                onFocus={handleSlugFocus}
                                placeholder="acme"
                            />
                            <span className="text-xs text-muted-foreground">Short, unique ID for your organization (e.g. acme)</span>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        <Button type="submit" size="lg" className="w-full" disabled={loading}>
                            {loading ? "Creating..." : "Create Organization"}
                        </Button>
                        {error && <div className="text-destructive text-sm text-center mt-1">{error}</div>}
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
} 