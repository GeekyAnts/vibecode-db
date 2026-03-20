/**
 * PocketBase - Open API Rules
 *
 * Sets all collection API rules to empty (public access) for development/playground use.
 * This is equivalent to using Supabase's service_role key that bypasses RLS.
 *
 * Usage:
 *   node open-api-rules.mjs
 */

import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

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
  throw new Error("Admin authentication failed.");
}

async function main() {
  console.log("\n🔓 PocketBase - Open API Rules\n");

  const { url: BASE, email, password } = await prompt();

  console.log(`\nAuthenticating with ${BASE} ...`);
  const token = await adminAuth(BASE, email, password);
  console.log("Authenticated.\n");

  const collections = ["users", "profiles", "projects", "tasks", "project_members", "comments", "activity_logs"];

  for (const name of collections) {
    const res = await fetch(`${BASE}/api/collections/${name}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({
        listRule: "",
        viewRule: "",
        createRule: "",
        updateRule: "",
        deleteRule: "",
      }),
    });

    if (res.ok) {
      console.log(`  ${name} -> public access`);
    } else {
      const data = await res.json();
      console.error(`  ${name} -> FAILED: ${JSON.stringify(data)}`);
    }
  }

  console.log("\nDone! All collections are now publicly accessible.");
  console.log("⚠️  This is for development/playground only. Do not use in production.\n");
}

main().catch((err) => {
  console.error("\nError:", err.message);
  process.exit(1);
});
