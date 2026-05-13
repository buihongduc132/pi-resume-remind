import { describe, expect, it, vi } from "vitest";

import {
  buildResumeSnippet,
  getDisplayName,
  getResumeCommand,
  getSessionUuid,
  printResumeSnippet,
} from "./resume.js";

describe("resume helpers", () => {
  it("extracts uuid from session file", () => {
    expect(
      getSessionUuid("/tmp/pi/2026-05-06T03-05-00_019df945-636f-74ad-a36d-aea65e3055b2.jsonl"),
    ).toBe("019df945-636f-74ad-a36d-aea65e3055b2");
  });

  it("generates uuid-based resume command", () => {
    expect(
      getResumeCommand("/tmp/pi/2026-05-06T03-05-00_019df945-636f-74ad-a36d-aea65e3055b2.jsonl"),
    ).toBe("pi --session 019df945-636f-74ad-a36d-aea65e3055b2");
  });

  it("falls back to quoted session path and ephemeral display name", () => {
    expect(getResumeCommand("/tmp/session.jsonl")).toBe('pi --session "/tmp/session.jsonl"');
    expect(getDisplayName({ sessionFile: undefined, sessionName: undefined })).toBe("ephemeral");
  });

  it("prefers explicit session name for snippet", () => {
    expect(
      buildResumeSnippet({
        sessionFile: "/tmp/pi/2026-05-06T03-05-00_019df945-636f-74ad-a36d-aea65e3055b2.jsonl",
        sessionName: "pi-plugins-0506-0305",
      }).lines,
    ).toEqual([
      "To resume session pi-plugins-0506-0305",
      "pi --session 019df945-636f-74ad-a36d-aea65e3055b2",
    ]);
  });

  it("prints exact two-line snippet", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    printResumeSnippet({
      sessionFile: "/tmp/pi/2026-05-06T03-05-00_019df945-636f-74ad-a36d-aea65e3055b2.jsonl",
      sessionName: "pi-plugins-0506-0305",
    });
    expect(spy.mock.calls).toEqual([
      ["To resume session pi-plugins-0506-0305"],
      ["pi --session 019df945-636f-74ad-a36d-aea65e3055b2"],
    ]);
    spy.mockRestore();
  });
});
