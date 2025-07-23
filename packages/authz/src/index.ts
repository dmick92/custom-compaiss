export const name = "authz";

// // Basic SpiceDB HTTP API client scaffold
// const SPICEDB_URL = process.env.SPICEDB_URL || 'http://localhost:8080/v1';
// const SPICEDB_TOKEN = process.env.SPICEDB_TOKEN || 'localkey';

// export async function checkPermission(resource: string, permission: string, subject: string) {
//     const res = await fetch(`${SPICEDB_URL}/permissions/check`, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${SPICEDB_TOKEN}`,
//         },
//         body: JSON.stringify({
//             resource: { objectType: 'document', objectId: resource },
//             permission,
//             subject: { object: { objectType: 'user', objectId: subject } },
//         }),
//     });
//     if (!res.ok) throw new Error('SpiceDB check failed');
//     return res.json();
// } 

import { permissions } from "./generated/permissions";

import { createClient } from "@authzed/authzed-node";

const client = createClient({
    url: "http://localhost:50051",
    token: "localkey",
});

// ✅ Type-safe operations - TypeScript will catch typos and invalid combinations
await permissions.document.grant
    .editor("user:alice", "document:doc1")
    .execute();



const perms = createPermissions(client);
await permissions.document.check.view("user:bob", "document:doc1").execute(client);
await permissions.folder.find.byOwner("user:alice").execute(client);