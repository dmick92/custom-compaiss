import fs from "node:fs/promises";
import {
    parseSpiceDBSchema,
    analyzeSpiceDbSchema,
    generateSDK,
} from "@schoolai/spicedb-zed-schema-parser";

async function generatePermissionsSDK() {
    try {
        // 1. Read your schema file
        const schemaContent = await fs.readFile("src/schema.zed", "utf-8");

        // 2. Parse the schema
        const { ast, errors: parseErrors } = parseSpiceDBSchema(schemaContent);

        if (parseErrors.length > 0) {
            console.error("Parse errors:", parseErrors);
            return;
        }

        if (!ast) {
            console.error("No AST generated from parsing");
            return;
        }

        // 3. Analyze the schema
        const {
            augmentedAst,
            errors: analysisErrors,
            isValid,
        } = analyzeSpiceDbSchema(ast);

        if (!isValid) {
            console.error("Analysis errors:", analysisErrors);
            return;
        }

        if (!augmentedAst) {
            console.error("No augmented AST generated from analysis");
            return;
        }

        // 4. Generate TypeScript SDK
        const generatedCode = generateSDK(augmentedAst);

        if (!generatedCode) {
            console.error("No code generated from SDK generation");
            return;
        }

        // 5. Write to file
        await fs.writeFile("src/permissions.ts", generatedCode);
        console.log("✅ Type-safe permissions SDK generated!");

    } catch (error) {
        console.error("Unexpected error during generation:", error);
        if (error instanceof Error) {
            console.error("Error stack:", error.stack);
        }
        throw error;
    }
}

// Call the function
generatePermissionsSDK().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});