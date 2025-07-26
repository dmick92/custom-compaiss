import { authClient } from "~/auth/client";
import { usePermission } from "~/hooks/usePermission";

export const PermissionGate = ({
    resource,
    permission,
    children,
}: {
    resource: string;
    permission: string;
    children: React.ReactNode;
}) => {
    const { data: session } = authClient.useSession();
    const userId = session?.user.id;

    // Always call usePermission to maintain hook order, but pass empty string when no userId
    const allowed = usePermission(userId || "", resource, permission);

    // Show nothing if not allowed
    if (!allowed) return null;
    return <>{children}</>;
};
