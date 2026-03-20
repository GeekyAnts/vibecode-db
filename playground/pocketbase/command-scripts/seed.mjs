/**
 * PocketBase Seed Script
 *
 * Seeds all collections with test data matching the Supabase seed.sql.
 * Prompts for credentials interactively.
 *
 * Usage:
 *   node seed.mjs
 */

import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

// ── prompt for credentials ───────────────────────────────────────────

async function prompt() {
  const rl = createInterface({ input: stdin, output: stdout });

  const url = await rl.question("PocketBase URL: ");
  const email = await rl.question("Admin email: ");

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

async function createRecord(base, token, collection, data) {
  const res = await fetch(`${base}/api/collections/${collection}/records`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) {
    throw new Error(`Failed to create record in "${collection}": ${JSON.stringify(result)}`);
  }
  return result;
}

async function listRecords(base, token, collection, filter) {
  const params = new URLSearchParams({ perPage: "500" });
  if (filter) params.set("filter", filter);
  const res = await fetch(`${base}/api/collections/${collection}/records?${params}`, {
    headers: { Authorization: token },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Failed to list records in "${collection}": ${JSON.stringify(data)}`);
  }
  return data.items;
}

// ── main ─────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🌱 PocketBase Seed\n");

  const { url: BASE, email, password } = await prompt();

  console.log(`\nAuthenticating with ${BASE} ...`);
  const token = await adminAuth(BASE, email, password);
  console.log("Authenticated.\n");

  // ── 1. Users ───────────────────────────────────────────────────────
  console.log("Seeding: users");
  const usersData = [
    { email: "alice@test.com", name: "Alice", emailVisibility: true },
    { email: "bob@test.com", name: "Bob", emailVisibility: true },
    { email: "charlie@test.com", name: "Charlie", emailVisibility: true },
    { email: "david@test.com", name: "David", emailVisibility: true },
    { email: "emma@test.com", name: "Emma", emailVisibility: true },
    { email: "frank@test.com", name: "Frank", emailVisibility: true },
  ];

  const users = [];
  for (const u of usersData) {
    const record = await createRecord(BASE, token, "users", {
      ...u,
      password: "testpassword123",
      passwordConfirm: "testpassword123",
    });
    users.push(record);
    console.log(`  -> ${u.name} (${record.id})`);
  }

  // ── 2. Profiles ────────────────────────────────────────────────────
  console.log("Seeding: profiles");
  const profilesData = [
    { userIdx: 0, avatar_url: "https://i.pravatar.cc/150?img=1", bio: "Fitness enthusiast" },
    { userIdx: 1, avatar_url: "https://i.pravatar.cc/150?img=2", bio: "Backend developer" },
    { userIdx: 2, avatar_url: "https://i.pravatar.cc/150?img=3", bio: "UI Designer" },
    { userIdx: 3, avatar_url: "https://i.pravatar.cc/150?img=4", bio: "Mobile dev" },
    { userIdx: 4, avatar_url: "https://i.pravatar.cc/150?img=5", bio: "Product manager" },
    { userIdx: 5, avatar_url: "https://i.pravatar.cc/150?img=6", bio: "DevOps engineer" },
  ];

  for (const p of profilesData) {
    await createRecord(BASE, token, "profiles", {
      user_id: users[p.userIdx].id,
      avatar_url: p.avatar_url,
      bio: p.bio,
    });
    console.log(`  -> ${p.bio}`);
  }

  // ── 3. Projects ────────────────────────────────────────────────────
  console.log("Seeding: projects");
  const projectsData = [
    { ownerIdx: 0, name: "Fitness App", description: "Track workouts" },
    { ownerIdx: 1, name: "AI Chatbot", description: "Conversational AI" },
    { ownerIdx: 2, name: "Design System", description: "Reusable UI components" },
    { ownerIdx: 3, name: "Travel Planner", description: "Plan trips" },
    { ownerIdx: 4, name: "Project Manager", description: "Team collaboration" },
    { ownerIdx: 5, name: "DevOps Toolkit", description: "Automation tools" },
  ];

  const projects = [];
  for (const p of projectsData) {
    const record = await createRecord(BASE, token, "projects", {
      owner_id: users[p.ownerIdx].id,
      name: p.name,
      description: p.description,
    });
    projects.push(record);
    console.log(`  -> ${p.name} (${record.id})`);
  }

  // ── 4. Tasks ───────────────────────────────────────────────────────
  console.log("Seeding: tasks");
  const task = await createRecord(BASE, token, "tasks", {
    project_id: projects[0].id,
    title: "Create database schema",
    status: "todo",
  });
  console.log(`  -> ${task.title} (${task.id})`);

  // ── 5. Comments ────────────────────────────────────────────────────
  console.log("Seeding: comments");
  const comment = await createRecord(BASE, token, "comments", {
    user_id: users[0].id,
    task_id: task.id,
    content: "Start with database design",
  });
  console.log(`  -> "${comment.content}" (${comment.id})`);

  // ── 6. Activity Logs ──────────────────────────────────────────────
  console.log("Seeding: activity_logs");
  await createRecord(BASE, token, "activity_logs", {
    user_id: users[0].id,
    entity_type: "project",
    entity_id: projects[0].id,
    action: "created",
  });
  console.log(`  -> project created log`);

  // ── 7. Project Members ────────────────────────────────────────────
  console.log("Seeding: project_members");

  // Owners
  for (let i = 0; i < projects.length; i++) {
    await createRecord(BASE, token, "project_members", {
      user_id: users[i].id,
      project_id: projects[i].id,
      role: "owner",
    });
    console.log(`  -> ${usersData[i].name} as owner of ${projectsData[i].name}`);
  }

  // Members (cross-join, skip owner, limit 10)
  let memberCount = 0;
  for (const user of users) {
    for (const project of projects) {
      if (memberCount >= 10) break;
      // skip if user is the owner
      if (user.id === project.owner_id) continue;
      await createRecord(BASE, token, "project_members", {
        user_id: user.id,
        project_id: project.id,
        role: "member",
      });
      memberCount++;
      console.log(`  -> member (${memberCount}/10)`);
    }
    if (memberCount >= 10) break;
  }

  console.log("\nSeeding complete!");
}

main().catch((err) => {
  console.error("\nError:", err.message);
  process.exit(1);
});
