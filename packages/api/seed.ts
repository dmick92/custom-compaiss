import { config } from "dotenv";
import { db } from "@acme/db/client";
import { Project, Task } from "@acme/db/schema";

// Load environment variables from .env file
config({ path: ".env" });

// Check for required environment variables
if (!process.env.POSTGRES_URL) {
  console.error("❌ Missing POSTGRES_URL environment variable");
  console.error("Please create a .env file in the packages/api directory with:");
  console.error("POSTGRES_URL=\"your_database_connection_string\"");
  console.error("");
  console.error("Example for local development:");
  console.error("POSTGRES_URL=\"postgresql://postgres:password@localhost:5432/myapp\"");
  console.error("");
  console.error("Example for Vercel Postgres:");
  console.error("POSTGRES_URL=\"postgresql://username:password@host:port/database\"");
  process.exit(1);
}

const ORG_ID = "3XqSov1rTbp5oYgl4qp8mXyQXIXJrRLq";
const USER_ID = "ldskoF3NfnIPw6dxiUcwOwgperk5vRn6";

async function seedProjectsAndTasks() {
  console.log("🌱 Seeding projects and tasks...");

  // Insert projects
  const projects = await db
    .insert(Project)
    .values([
      {
        name: "E-commerce Platform Redesign",
        description:
          "Complete overhaul of the online store with modern UI/UX and improved performance",
        status: "ACTIVE",
        flowData: { nodes: [], edges: [] },
        priority: "Critical",
        orgId: ORG_ID,
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
      },
      {
        name: "Mobile App Development",
        description:
          "Build a cross-platform mobile application for iOS and Android",
        status: "ACTIVE",
        flowData: { nodes: [], edges: [] },
        priority: "High",
        orgId: ORG_ID,
        createdAt: new Date("2024-02-01"),
        updatedAt: new Date("2024-02-01"),
      },
      {
        name: "Marketing Campaign Q2",
        description:
          "Quarterly marketing initiatives including social media, email, and content marketing",
        status: "DRAFT",
        flowData: { nodes: [], edges: [] },
        priority: "Medium",
        orgId: ORG_ID,
        createdAt: new Date("2024-03-10"),
        updatedAt: new Date("2024-03-10"),
      },
    ])
    .returning();

  console.log(`✅ Inserted ${projects.length} projects`);

  // Ensure all projects were created successfully
  if (projects.length !== 3) {
    throw new Error(
      `Expected 3 projects to be created, but got ${projects.length}`,
    );
  }

  const [project1, project2, project3] = projects;

  // Insert tasks for each project
  const tasks = await db
    .insert(Task)
    .values([
      // Tasks for E-commerce Platform Redesign (Critical priority)
      {
        projectId: project1.id,
        orgId: ORG_ID,
        userId: USER_ID,
        type: "design",
        data: {
          title: "Create wireframes",
          description: "Design wireframes for all major pages",
        },
        positionX: 100,
        positionY: 100,
        createdAt: new Date("2024-01-16"),
        updatedAt: new Date("2024-01-16"),
      },
      {
        projectId: project1.id,
        orgId: ORG_ID,
        userId: USER_ID,
        type: "development",
        data: {
          title: "Implement responsive design",
          description: "Make the site mobile-friendly",
        },
        positionX: 200,
        positionY: 100,
        createdAt: new Date("2024-01-17"),
        updatedAt: new Date("2024-01-17"),
      },
      {
        projectId: project1.id,
        orgId: ORG_ID,
        userId: USER_ID,
        type: "testing",
        data: {
          title: "Performance testing",
          description: "Test site speed and optimization",
        },
        positionX: 300,
        positionY: 100,
        createdAt: new Date("2024-01-18"),
        updatedAt: new Date("2024-01-18"),
      },
      {
        projectId: project1.id,
        orgId: ORG_ID,
        userId: USER_ID,
        type: "deployment",
        data: {
          title: "Deploy to staging",
          description: "Deploy the new design to staging environment",
        },
        positionX: 400,
        positionY: 100,
        createdAt: new Date("2024-01-19"),
        updatedAt: new Date("2024-01-19"),
      },
      {
        projectId: project1.id,
        orgId: ORG_ID,
        userId: USER_ID,
        type: "content",
        data: {
          title: "Update product images",
          description: "Replace all product images with high-quality versions",
        },
        positionX: 500,
        positionY: 100,
        createdAt: new Date("2024-01-20"),
        updatedAt: new Date("2024-01-20"),
      },
      {
        projectId: project1.id,
        orgId: ORG_ID,
        userId: USER_ID,
        type: "testing",
        data: {
          title: "User acceptance testing",
          description: "Conduct UAT with key stakeholders",
        },
        positionX: 600,
        positionY: 100,
        createdAt: new Date("2024-01-21"),
        updatedAt: new Date("2024-01-21"),
      },

      // Tasks for Mobile App Development (High priority)
      {
        projectId: project2.id,
        orgId: ORG_ID,
        userId: USER_ID,
        type: "planning",
        data: {
          title: "Define app requirements",
          description: "Gather and document all app requirements",
        },
        positionX: 100,
        positionY: 200,
        createdAt: new Date("2024-02-02"),
        updatedAt: new Date("2024-02-02"),
      },
      {
        projectId: project2.id,
        orgId: ORG_ID,
        userId: USER_ID,
        type: "design",
        data: {
          title: "Create app mockups",
          description: "Design UI/UX mockups for all screens",
        },
        positionX: 200,
        positionY: 200,
        createdAt: new Date("2024-02-03"),
        updatedAt: new Date("2024-02-03"),
      },
      {
        projectId: project2.id,
        orgId: ORG_ID,
        userId: USER_ID,
        type: "development",
        data: {
          title: "Set up development environment",
          description: "Configure React Native development setup",
        },
        positionX: 300,
        positionY: 200,
        createdAt: new Date("2024-02-04"),
        updatedAt: new Date("2024-02-04"),
      },
      {
        projectId: project2.id,
        orgId: ORG_ID,
        userId: USER_ID,
        type: "development",
        data: {
          title: "Implement core features",
          description: "Build authentication and main app functionality",
        },
        positionX: 400,
        positionY: 200,
        createdAt: new Date("2024-02-05"),
        updatedAt: new Date("2024-02-05"),
      },
      {
        projectId: project2.id,
        orgId: ORG_ID,
        userId: USER_ID,
        type: "testing",
        data: {
          title: "Device testing",
          description: "Test on various iOS and Android devices",
        },
        positionX: 500,
        positionY: 200,
        createdAt: new Date("2024-02-06"),
        updatedAt: new Date("2024-02-06"),
      },

      // Tasks for Marketing Campaign Q2 (Medium priority)
      {
        projectId: project3.id,
        orgId: ORG_ID,
        userId: USER_ID,
        type: "planning",
        data: {
          title: "Define campaign goals",
          description: "Set specific KPIs and success metrics",
        },
        positionX: 100,
        positionY: 300,
        createdAt: new Date("2024-03-11"),
        updatedAt: new Date("2024-03-11"),
      },
      {
        projectId: project3.id,
        orgId: ORG_ID,
        userId: USER_ID,
        type: "content",
        data: {
          title: "Create content calendar",
          description: "Plan all content for the quarter",
        },
        positionX: 200,
        positionY: 300,
        createdAt: new Date("2024-03-12"),
        updatedAt: new Date("2024-03-12"),
      },
      {
        projectId: project3.id,
        orgId: ORG_ID,
        userId: USER_ID,
        type: "design",
        data: {
          title: "Design campaign assets",
          description: "Create graphics and visual content",
        },
        positionX: 300,
        positionY: 300,
        createdAt: new Date("2024-03-13"),
        updatedAt: new Date("2024-03-13"),
      },
    ])
    .returning();

  console.log(`✅ Inserted ${tasks.length} tasks`);
  console.log("🎉 Seeding completed successfully!");

  return { projects, tasks };
}

// Run the seeding function
async function main() {
  try {
    await seedProjectsAndTasks();
    console.log("Seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

main();
