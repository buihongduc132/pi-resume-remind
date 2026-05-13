import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

import { registerResumeCommand } from "./commands.js";
import { getShortId, printResumeSnippet, type ResumeSessionState } from "./resume.js";

export default function piResumeRemind(pi: ExtensionAPI): void {
  let currentState: ResumeSessionState = {};

  registerResumeCommand(pi, () => currentState);

  pi.on("session_start", async (_event, ctx) => {
    try {
      const sessionFile = ctx.sessionManager.getSessionFile();
      const sessionName = ctx.sessionManager.getSessionName() || getShortId(sessionFile);
      currentState = { sessionFile, sessionName };
    } catch {
      currentState = {};
    }
  });

  pi.on("session_shutdown", async (event) => {
    try {
      if (event.reason !== "quit") return;
      printResumeSnippet(currentState);
    } catch {
      // Exception-safe by design: never block shutdown.
    }
  });
}
