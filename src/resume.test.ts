import { describe, expect, it, vi } from "vitest";
import { writeFileSync, unlinkSync, mkdirSync } from "node:fs";
import { join } from "node:path";

import {
  buildResumeSnippet,
  getDisplayName,
  getResumeCommand,
  getSessionUuid,
  getSessionId,
  printResumeSnippet,
} from "./resume.js";

describe("resume helpers", () => {
  it("extracts uuid from session file", () => {
    expect(
      getSessionUuid("/tmp/pi/2026-05-06T03-05-00_019df945-636f-74ad-a36d-aea65e3055b2.jsonl"),
    ).toBe("019df945-636f-74ad-a36d-aea65e3055b2");
  });

  describe("getSessionId — UUID mismatch bug (RED phase)", () => {
    const tempDir = "/tmp/pi-resume-remind-test";
    const filenameUuid = "019fe7ca-3232-73c5-ba0c-7008da81857a";
    const internalId = "019fe937-2c64-76b2-b8db-ba258ce46840";

    it("returns INTERNAL id when filename UUID differs from internal id", () => {
      mkdirSync(tempDir, { recursive: true });
      const tempFile = join(tempDir, `2026-08-09T18-30-15-858Z_${filenameUuid}.jsonl`);
      const header = JSON.stringify({
        type: "session",
        id: internalId,
        version: 3,
        timestamp: "2026-08-09T18:30:15.858Z",
        cwd: "/tmp",
      });
      writeFileSync(tempFile, header + "\n");

      try {
        const result = getSessionId(tempFile);
        expect(result).toBe(internalId);
        expect(result).not.toBe(filenameUuid);
      } finally {
        unlinkSync(tempFile);
      }
    });

    it("falls back to filename UUID when file is empty", () => {
      mkdirSync(tempDir, { recursive: true });
      const tempFile = join(tempDir, `2026-08-09T18-30-15-858Z_${filenameUuid}.jsonl`);
      writeFileSync(tempFile, "");

      try {
        const result = getSessionId(tempFile);
        expect(result).toBe(filenameUuid);
      } finally {
        unlinkSync(tempFile);
      }
    });

    it("falls back to filename UUID when JSON is corrupted", () => {
      mkdirSync(tempDir, { recursive: true });
      const tempFile = join(tempDir, `2026-08-09T18-30-15-858Z_${filenameUuid}.jsonl`);
      writeFileSync(tempFile, "{ corrupted json\n");

      try {
        const result = getSessionId(tempFile);
        expect(result).toBe(filenameUuid);
      } finally {
        unlinkSync(tempFile);
      }
    });

    it("falls back to filename UUID when file does not exist", () => {
      const tempFile = join(tempDir, `2026-08-09T18-30-15-858Z_${filenameUuid}.jsonl`);
      const result = getSessionId(tempFile);
      expect(result).toBe(filenameUuid);
    });

    it("falls back to filename UUID when first line is not a session header", () => {
      mkdirSync(tempDir, { recursive: true });
      const tempFile = join(tempDir, `2026-08-09T18-30-15-858Z_${filenameUuid}.jsonl`);
      const messageEntry = JSON.stringify({
        type: "message",
        role: "user",
        content: "hello",
      });
      writeFileSync(tempFile, messageEntry + "\n");

      try {
        const result = getSessionId(tempFile);
        expect(result).toBe(filenameUuid);
      } finally {
        unlinkSync(tempFile);
      }
    });

    it("returns null when sessionFile is undefined", () => {
      const result = getSessionId(undefined);
      expect(result).toBeNull();
    });

    it("returns null when filename has no UUID pattern", () => {
      const result = getSessionId("/tmp/no-uuid-here.jsonl");
      expect(result).toBeNull();
    });
  });

  it("generates uuid-based resume command", () => {
    expect(
      getResumeCommand("/tmp/pi/2026-05-06T03-05-00_019df945-636f-74ad-a36d-aea65e3055b2.jsonl"),
    ).toBe("pi --session 019df945-636f-74ad-a36d-aea65e3055b2");
  });

  it("uses internal session id in resume command when filename UUID differs", () => {
    const tempDir = "/tmp/pi-resume-remind-test";
    mkdirSync(tempDir, { recursive: true });
    const filenameUuid = "019fe7ca-3232-73c5-ba0c-7008da81857a";
    const internalId = "019fe937-2c64-76b2-b8db-ba258ce46840";
    const tempFile = join(tempDir, `2026-08-09T18-30-15-858Z_${filenameUuid}.jsonl`);
    const header = JSON.stringify({
      type: "session",
      id: internalId,
      version: 3,
      timestamp: "2026-08-09T18:30:15.858Z",
      cwd: "/tmp",
    });
    writeFileSync(tempFile, header + "\n");

    try {
      const result = getResumeCommand(tempFile);
      expect(result).toBe(`pi --session ${internalId}`);
      expect(result).not.toContain(filenameUuid);
    } finally {
      unlinkSync(tempFile);
    }
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
