import { spawn } from "node:child_process";
import process from "node:process";
import {
  ReadBuffer,
  serializeMessage,
} from "@modelcontextprotocol/sdk/shared/stdio.js";

export class SmokeStdioClientTransport {
  constructor(server) {
    this.server = server;
    this.readBuffer = new ReadBuffer();
    this.process = null;
    this.stderr = "";
    this.onclose = undefined;
    this.onerror = undefined;
    this.onmessage = undefined;
  }

  async start() {
    if (this.process) {
      throw new Error("SmokeStdioClientTransport already started.");
    }

    return new Promise((resolve, reject) => {
      const child = spawn(this.server.command, this.server.args ?? [], {
        cwd: this.server.cwd,
        env: { ...process.env, ...(this.server.env ?? {}) },
        stdio: ["pipe", "pipe", "pipe"],
        shell: this.server.shell ?? false,
        windowsHide: true,
      });
      this.process = child;

      child.once("error", (error) => {
        reject(error);
        this.onerror?.(error);
      });
      child.once("spawn", () => {
        resolve();
      });
      child.once("close", () => {
        this.process = null;
        this.onclose?.();
      });

      child.stdin?.on("error", (error) => {
        this.onerror?.(error);
      });
      child.stdout?.on("data", (chunk) => {
        this.readBuffer.append(chunk);

        while (true) {
          try {
            const message = this.readBuffer.readMessage();
            if (message == null) {
              break;
            }
            this.onmessage?.(message);
          } catch (error) {
            this.onerror?.(error);
          }
        }
      });
      child.stdout?.on("error", (error) => {
        this.onerror?.(error);
      });
      child.stderr?.on("data", (chunk) => {
        this.stderr += chunk.toString();
      });
      child.stderr?.on("error", (error) => {
        this.onerror?.(error);
      });
    });
  }

  async close() {
    const child = this.process;
    if (!child) {
      return;
    }

    this.process = null;
    const closePromise = new Promise((resolve) => {
      child.once("close", () => resolve());
    });

    try {
      child.stdin?.end();
    } catch {
      // Ignore shutdown errors during the smoke test.
    }

    await Promise.race([
      closePromise,
      new Promise((resolve) => setTimeout(resolve, 2000)),
    ]);

    if (child.exitCode == null) {
      child.kill("SIGTERM");
      await Promise.race([
        closePromise,
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]);
    }

    if (child.exitCode == null) {
      child.kill("SIGKILL");
    }
  }

  send(message) {
    return new Promise((resolve, reject) => {
      if (!this.process?.stdin) {
        reject(new Error("SmokeStdioClientTransport is not connected."));
        return;
      }

      this.process.stdin.write(serializeMessage(message), (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }
}
