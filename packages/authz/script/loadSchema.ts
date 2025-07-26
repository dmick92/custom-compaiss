export const name = "authz";

import { PermissionOperations, SpiceDBClient } from "@schoolai/spicedb-zed-schema-parser/builder";
const SPICEDB_URL = process.env.SPICEDB_URL || 'localhost:50051';
const SPICEDB_TOKEN = process.env.SPICEDB_TOKEN || 'localkey';

import { permissions } from "../src/permissions";
import { v1 as authzed } from "@authzed/authzed-node";
import fs from "node:fs/promises";

// Create client for local development
const { promises: authzedClient } = authzed.NewClient(SPICEDB_TOKEN, SPICEDB_URL, 1);
const client = authzedClient as unknown as SpiceDBClient;

const op = PermissionOperations.lookup().subjectsWithAccessTo("project:1").ofType("user")


// Function to load schema into SpiceDB
async function loadSchema() {
    console.log("Loading schema...");
    try {
        const schemaContent = await fs.readFile("src/schema.zed", "utf-8");

        // Write schema to SpiceDB
        const loaded = await client.writeSchema({
            schema: schemaContent
        });
        console.log(loaded);

        console.log("✅ Schema loaded into SpiceDB");
        //console.log(await PermissionOperations.lookup().subjectsWithAccessTo("process:89b1fc48-1fd1-4ba3-8686-cc1e13cb9ff3").ofType("user").withPermissions(["read"], client))
    } catch (error) {
        console.error("❌ Failed to load schema:", error);
    }
}

// Run the init function
loadSchema().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});