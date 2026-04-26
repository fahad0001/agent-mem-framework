import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { info, ok, fail } from "../util/log.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface McpOptions {
  cwd: string;
  print?: boolean;
  writable?: boolean;
}

/**
 * Resolve the bundled mcp-server entry point. The CLI ships sibling-package
 * `@agent-mem/mcp-server`; in a workspace install we look upward from this
 * file. In a global install both packages are siblings under the same
 * registry namespace, so we also try `node_modules/@agent-mem/mcp-server/`.
 */
function resolveMcpEntry(): string | null {
  const candidates = [
    // Bundled CLI: cli/agent-mem/dist → cli/mcp-server/dist/server.js
    path.resolve(__dirname, "..", "..", "mcp-server", "dist", "server.js"),
    // Non-bundled: cli/agent-mem/dist/commands → cli/mcp-server/dist/server.js
    path.resolve(
      __dirname,
      "..",
      "..",
      "..",
      "mcp-server",
      "dist",
      "server.js",
    ),
    // Source dev: cli/agent-mem/src/commands → cli/mcp-server/dist/server.js
    path.resolve(
      __dirname,
      "..",
      "..",
      "..",
      "..",
      "mcp-server",
      "dist",
      "server.js",
    ),
    // Global install: peer @agent-mem/mcp-server alongside agent-mem
    path.resolve(
      __dirname,
      "..",
      "..",
      "..",
      "@agent-mem",
      "mcp-server",
      "dist",
      "server.js",
    ),
  ];
  return candidates.find((p) => fs.existsSync(p)) ?? null;
}

export async function cmdMcp(opts: McpOptions): Promise<void> {
  const entry = resolveMcpEntry();
  if (!entry) {
    fail(
      "Could not locate the @agent-mem/mcp-server build. Run `npm --prefix cli/mcp-server build`.",
    );
    return;
  }

  if (opts.print) {
    const args = [
      entry,
      "--cwd",
      opts.cwd,
      ...(opts.writable ? ["--writable"] : []),
    ];
    const cfg = {
      mcpServers: {
        "agent-mem": {
          command: process.execPath,
          args,
        },
      },
    };
    process.stdout.write(JSON.stringify(cfg, null, 2) + "\n");
    return;
  }

  ok(
    `Launching agent-mem MCP server (cwd=${opts.cwd}${opts.writable ? ", writable" : ", read-only"})`,
  );
  info(`Entry: ${entry}`);
  info(`Reads stdin / writes stdout as JSON-RPC. Press Ctrl+C to stop.`);

  const args = [
    entry,
    "--cwd",
    opts.cwd,
    ...(opts.writable ? ["--writable"] : []),
  ];
  const child = spawn(process.execPath, args, {
    stdio: "inherit",
  });
  await new Promise<void>((resolve, reject) => {
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`exit ${code}`)),
    );
    child.on("error", reject);
  });
}
