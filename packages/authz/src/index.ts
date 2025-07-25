export const name = "authz";

import { PermissionOperations, SpiceDBClient } from "@schoolai/spicedb-zed-schema-parser/builder";
const SPICEDB_URL = process.env.SPICEDB_URL || 'localhost:8081';
const SPICEDB_TOKEN = process.env.SPICEDB_TOKEN || 'localkey';

import { permissions } from "./permissions.js";
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
        await client.writeSchema({
            schema: schemaContent
        });

        console.log("✅ Schema loaded into SpiceDB");
    } catch (error) {
        console.error("❌ Failed to load schema:", error);
    }
}

// Function to test permissions
async function testPermissions() {
    try {
        // First, grant some permissions
        await permissions.project.grant.editor("user:alice", "project:1").execute(client);
        console.log("✅ Granted editor permission to alice on document:1");

        // Then check permissions
        const canEdit = await permissions.project.check.edit("user:alice", "project:1").execute(client);
        console.log("✅ Permission check result:", canEdit);

    } catch (error) {
        console.error("❌ Permission test failed:", error);
    }
}

// Initialize and test
async function init() {
    console.log("Initializing...");
    await loadSchema();
    await testPermissions();
}

// Run the init function
init().catch(console.error);