// usePermission.ts
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";

export const usePermission = (userId: string, resource: string, permission: string) => {
    const trpc = useTRPC();
    const { data } = useQuery(
        trpc.permission.check.queryOptions(
            { userId, resource, permission },
            { enabled: !!userId, retry: false },
        ),
    );
    return data?.allowed;
};

export const useBatchPermissions = (
    userId: string,
    resources: string[],
    permissions: string[] = ["read", "update", "delete", "view", "edit"],
) => {
    const trpc = useTRPC();

    return useQuery(
        trpc.permission.batchCheck.queryOptions(
            { userId, resources, permissions },
            {
                enabled: !!userId && resources.length > 0 && permissions.length > 0,
                retry: false
            },
        ),
    );
};
