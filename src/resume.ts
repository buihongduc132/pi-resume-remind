export type ResumeSessionState = {
  sessionFile?: string;
  sessionName?: string;
};

export type ResumeSnippet = {
  name: string;
  command: string;
  lines: [string, string];
};

export function getSessionUuid(sessionFile: string | undefined): string | null {
  if (!sessionFile) return null;
  const match = sessionFile.match(/_([0-9a-f-]+)\.jsonl$/);
  return match ? match[1] : null;
}

export function getShortId(sessionFile: string | undefined): string {
  const uuid = getSessionUuid(sessionFile);
  return uuid ? uuid.slice(0, 8) : "ephemeral";
}

export function getResumeCommand(sessionFile: string | undefined): string {
  const uuid = getSessionUuid(sessionFile);
  if (uuid) return `pi --session ${uuid}`;
  if (sessionFile) return `pi --session "${sessionFile}"`;
  return "pi";
}

export function getDisplayName(state: ResumeSessionState): string {
  return state.sessionName || getShortId(state.sessionFile);
}

export function buildResumeSnippet(state: ResumeSessionState): ResumeSnippet {
  const name = getDisplayName(state);
  const command = getResumeCommand(state.sessionFile);
  return {
    name,
    command,
    lines: [`To resume session ${name}`, command],
  };
}

export function printResumeSnippet(state: ResumeSessionState): ResumeSnippet {
  const snippet = buildResumeSnippet(state);
  console.log(snippet.lines[0]);
  console.log(snippet.lines[1]);
  return snippet;
}
