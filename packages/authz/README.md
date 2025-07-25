# AuthZ Package

This package provides authorization using SpiceDB.

## Setup

### 1. Install SpiceDB

You can run SpiceDB locally using Docker:

```bash
docker run -p 8080:8080 -p 8081:8081 authzed/spicedb serve --grpc-preshared-key "localkey" --http-addr ":8080" --grpc-addr ":8081"
```

### 2. Environment Variables

Set these environment variables:

```bash
SPICEDB_URL=http://localhost:8080/v1
SPICEDB_TOKEN=localkey
```

### 3. Generate Permissions SDK

Run the generation script to create the TypeScript SDK:

```bash
npm run generate:sdk
```

### 4. Test the Setup

Run the test script:

```bash
node src/index.ts
```

## Schema

The schema is defined in `src/schema.zed` and includes:

- **User**: Basic user entity
- **Document**: Has owner, editor, and viewer relations
- **Folder**: Has owner, editor, and parent relations with inheritance

## Usage

```typescript
import { permissions } from "@acme/authz";

// Grant permissions
await permissions.document.grant
  .editor("user:alice", "document:1")
  .execute(client);

// Check permissions
const canEdit = await permissions.document.check
  .edit("user:alice", "document:1")
  .execute(client);

// Find resources
const documents = await permissions.document.find
  .byEditor("user:alice")
  .execute(client);
```
