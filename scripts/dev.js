import { spawn } from "node:child_process";
import process from "node:process";

function run(command, args, options = {}) {
  const child = spawn(command, args, {
    stdio: "inherit",
    shell: false,
    ...options
  });

  child.on("exit", (code) => {
    if (code && code !== 0) {
      process.exitCode = code;
    }
  });

  return child;
}

const server = run("node", ["server/index.js"], {
  env: {
    ...process.env,
    PORT: process.env.PORT || "8787"
  }
});

const client = run("vite", [], {
  env: {
    ...process.env,
    VITE_API_BASE_URL: process.env.VITE_API_BASE_URL || ""
  }
});

function shutdown(signal) {
  server.kill(signal);
  client.kill(signal);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
