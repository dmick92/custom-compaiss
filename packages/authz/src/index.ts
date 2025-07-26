export const name = "authz";

import { SpiceDBClient } from "@schoolai/spicedb-zed-schema-parser/builder";
const SPICEDB_URL = process.env.SPICEDB_URL || 'localhost:50051';
const SPICEDB_TOKEN = process.env.SPICEDB_TOKEN || 'localkey';

import { v1 as authzed } from "@authzed/authzed-node";
import { permissions } from "./permissions";

// Create client for local development
const { promises: authzedClient } = authzed.NewClient(SPICEDB_TOKEN, SPICEDB_URL, 1);
const client = authzedClient as unknown as SpiceDBClient;

export { permissions, client as spicedbClient };