/**
 * Create a project if it does not exist yet, then add a task to it.
 * Run with your project's TypeScript runner and FACTUAREA_API_KEY configured;
 * the key needs the `projects:read`, `projects:write` and `tasks:write` scopes.
 */
import {
  Factuarea,
  NotFoundError,
  type CreateProjectV1Request,
  type CreateTaskV1Request,
  type Project,
  type Task,
} from "../src/index.js";

const factuarea = new Factuarea({ apiKey: process.env.FACTUAREA_API_KEY! });
const projectInput: CreateProjectV1Request = { name: "Website", key: "WEB", icon: "rocket" };

// A project key is unique per company, so look it up before creating it.
async function ensureProject(): Promise<Project> {
  try {
    const { data } = (await factuarea.projects.findByKey({ key: projectInput.key })) as { data: Project };
    return data;
  } catch (error) {
    if (!(error instanceof NotFoundError) || error.code !== "project_not_found") throw error;
    const { data } = (await factuarea.projects.create(projectInput)) as { data: Project };
    return data;
  }
}

const project = await ensureProject();
const input: CreateTaskV1Request = {
  project_id: project.id,
  title: "Review the checkout flow",
  priority: "high",
  due_on: "2026-10-15",
};
// Retrying with the same Idempotency-Key never creates a second task.
const { data: task } = (await factuarea.tasks.create(input, {
  idempotencyKey: "review-checkout-flow-2026-10",
})) as { data: Task };
console.log("Task:", task.key, task.id);
