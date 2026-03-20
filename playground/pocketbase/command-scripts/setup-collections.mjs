/**
 * PocketBase Collection Setup Script
 *
 * Creates all collections on a remote PocketBase instance via the Admin API.
 * Prompts for credentials interactively.
 *
 * Usage:
 *   node setup-collections.mjs
 */

import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

// ── prompt for credentials ───────────────────────────────────────────

async function prompt() {
  const rl = createInterface({ input: stdin, output: stdout });

  const url = await rl.question("PocketBase URL: ");
  const email = await rl.question("Admin email: ");

  // hide password input
  stdout.write("Admin password: ");
  const password = await new Promise((resolve) => {
    let pw = "";
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    const onData = (ch) => {
      if (ch === "\n" || ch === "\r" || ch === "\u0004") {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener("data", onData);
        stdout.write("\n");
        resolve(pw);
      } else if (ch === "\u0003") {
        process.exit();
      } else if (ch === "\u007F" || ch === "\b") {
        pw = pw.slice(0, -1);
      } else {
        pw += ch;
        stdout.write("*");
      }
    };
    stdin.on("data", onData);
  });

  rl.close();
  return { url: url.replace(/\/$/, ""), email, password };
}

// ── helpers ──────────────────────────────────────────────────────────

async function adminAuth(base, email, password) {
  for (const path of [
    "/api/collections/_superusers/auth-with-password",
    "/api/admins/auth-with-password",
  ]) {
    const res = await fetch(`${base}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identity: email, password }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.token;
    }
  }
  throw new Error("Admin authentication failed. Check your credentials.");
}

async function createCollection(base, token, body) {
  // Skip if already exists
  const existing = await getCollectionByName(base, token, body.name);
  if (existing) {
    console.log(`  -> already exists (${existing.id}), skipping`);
    return existing;
  }

  const res = await fetch(`${base}/api/collections`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Failed to create "${body.name}": ${JSON.stringify(data)}`);
  }
  return data;
}

async function getCollectionByName(base, token, name) {
  const res = await fetch(`${base}/api/collections/${name}`, {
    headers: { Authorization: token },
  });
  if (res.ok) return res.json();
  return null;
}

async function updateCollection(base, token, id, body) {
  const res = await fetch(`${base}/api/collections/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Failed to update collection ${id}: ${JSON.stringify(data)}`);
  }
  return data;
}

// ── main ─────────────────────────────────────────────────────────────

async function main() {
  console.log("\n📦 PocketBase DB Push\n");

  const { url: BASE, email, password } = await prompt();

  console.log(`\nAuthenticating with ${BASE} ...`);
  const token = await adminAuth(BASE, email, password);
  console.log("Authenticated.\n");

  const ids = {};

  // 1. Users — use the built-in PocketBase auth collection
  console.log("Resolving: users (built-in auth collection)");
  const existingUsers = await getCollectionByName(BASE, token, "users");
  if (!existingUsers) {
    throw new Error("Built-in 'users' auth collection not found. Please create it from the PocketBase admin UI first.");
  }
  ids.users = existingUsers.id;
  console.log(`  -> using existing id: ${existingUsers.id}`);

  // 2. Profiles
  console.log("Creating: profiles");
  const profiles = await createCollection(BASE, token, {
    name: "profiles",
    type: "base",
    fields: [
      {
        name: "user_id",
        type: "relation",
        required: true,
        collectionId: ids.users,
        cascadeDelete: true,
        maxSelect: 1,
      },
      { name: "avatar_url", type: "url", required: false },
      { name: "bio", type: "text", required: false },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_profiles_user_id ON profiles (user_id)"],
  });
  ids.profiles = profiles.id;
  console.log(`  -> id: ${profiles.id}`);

  // 3. Projects
  console.log("Creating: projects");
  const projects = await createCollection(BASE, token, {
    name: "projects",
    type: "base",
    fields: [
      {
        name: "owner_id",
        type: "relation",
        required: true,
        collectionId: ids.users,
        cascadeDelete: true,
        maxSelect: 1,
      },
      { name: "name", type: "text", required: true },
      { name: "description", type: "text", required: false },
    ],
  });
  ids.projects = projects.id;
  console.log(`  -> id: ${projects.id}`);

  // 4. Tasks
  console.log("Creating: tasks");
  const tasks = await createCollection(BASE, token, {
    name: "tasks",
    type: "base",
    fields: [
      {
        name: "project_id",
        type: "relation",
        required: true,
        collectionId: ids.projects,
        cascadeDelete: true,
        maxSelect: 1,
      },
      { name: "title", type: "text", required: true },
      {
        name: "status",
        type: "select",
        required: false,
        values: ["todo", "in_progress", "done"],
        maxSelect: 1,
      },
    ],
  });
  ids.tasks = tasks.id;
  console.log(`  -> id: ${tasks.id}`);

  // 5. Project Members
  console.log("Creating: project_members");
  const projectMembers = await createCollection(BASE, token, {
    name: "project_members",
    type: "base",
    fields: [
      {
        name: "user_id",
        type: "relation",
        required: true,
        collectionId: ids.users,
        cascadeDelete: true,
        maxSelect: 1,
      },
      {
        name: "project_id",
        type: "relation",
        required: true,
        collectionId: ids.projects,
        cascadeDelete: true,
        maxSelect: 1,
      },
      {
        name: "role",
        type: "select",
        required: false,
        values: ["member", "admin", "owner"],
        maxSelect: 1,
      },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_unique_membership ON project_members (user_id, project_id)"],
  });
  ids.project_members = projectMembers.id;
  console.log(`  -> id: ${projectMembers.id}`);

  // 6. Comments (self-referencing — create first, then patch)
  console.log("Creating: comments");
  const comments = await createCollection(BASE, token, {
    name: "comments",
    type: "base",
    fields: [
      {
        name: "user_id",
        type: "relation",
        required: true,
        collectionId: ids.users,
        cascadeDelete: true,
        maxSelect: 1,
      },
      {
        name: "task_id",
        type: "relation",
        required: true,
        collectionId: ids.tasks,
        cascadeDelete: true,
        maxSelect: 1,
      },
      { name: "content", type: "text", required: true },
    ],
  });
  ids.comments = comments.id;
  console.log(`  -> id: ${comments.id}`);

  // Add self-referencing parent_comment_id
  console.log("  -> adding parent_comment_id (self-reference)");
  await updateCollection(BASE, token, ids.comments, {
    fields: [
      ...comments.fields,
      {
        name: "parent_comment_id",
        type: "relation",
        required: false,
        collectionId: ids.comments,
        cascadeDelete: true,
        maxSelect: 1,
      },
    ],
  });

  // 7. Activity Logs
  console.log("Creating: activity_logs");
  const activityLogs = await createCollection(BASE, token, {
    name: "activity_logs",
    type: "base",
    fields: [
      {
        name: "user_id",
        type: "relation",
        required: true,
        collectionId: ids.users,
        cascadeDelete: true,
        maxSelect: 1,
      },
      { name: "entity_type", type: "text", required: true },
      { name: "entity_id", type: "text", required: true },
      { name: "action", type: "text", required: true },
    ],
  });
  ids.activity_logs = activityLogs.id;
  console.log(`  -> id: ${activityLogs.id}`);

  // 8–10. Storage collections (avatars, documents, media)
  const storageSchema = [
    { name: "file", type: "file", required: true, maxSelect: 1, maxSize: 10485760 },
    { name: "path", type: "text", required: false },
    { name: "mime_type", type: "text", required: false },
    { name: "size", type: "number", required: false },
  ];

  for (const bucketName of ["avatars", "documents", "media"]) {
    console.log(`Creating: ${bucketName}`);
    const col = await createCollection(BASE, token, {
      name: bucketName,
      type: "base",
      fields: storageSchema,
      listRule: "",
      viewRule: "",
      createRule: "",
      updateRule: "",
      deleteRule: "",
    });
    ids[bucketName] = col.id;
    console.log(`  -> id: ${col.id}`);
  }

  console.log("\nAll collections created successfully!");
  console.log("\nCollection IDs:");
  for (const [name, id] of Object.entries(ids)) {
    console.log(`  ${name}: ${id}`);
  }
}

main().catch((err) => {
  console.error("\nError:", err.message);
  process.exit(1);
});
