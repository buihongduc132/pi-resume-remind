import type { ResumeSessionState } from "./resume.js";
import { printResumeSnippet } from "./resume.js";

type CommandRegistrar = {
  registerCommand: (
    name: string,
    options: {
      description: string;
      handler: (args: string, ctx: unknown) => Promise<void>;
    },
  ) => void;
};

export function registerResumeCommand(
  pi: CommandRegistrar,
  getState: () => ResumeSessionState,
): void {
  pi.registerCommand("resume-remind", {
    description: "Print the current session resume snippet",
    handler: async () => {
      printResumeSnippet(getState());
    },
  });
}
