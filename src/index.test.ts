import { describe, expect, it, vi } from "vitest";

import piResumeRemind from "./index.js";

type Handler = (...args: any[]) => Promise<void> | void;

function createPiStub() {
  const handlers = new Map<string, Handler[]>();
  const commands = new Map<string, { description: string; handler: Handler }>();

  return {
    handlers,
    commands,
    pi: {
      on(event: string, handler: Handler) {
        const existing = handlers.get(event) ?? [];
        existing.push(handler);
        handlers.set(event, existing);
      },
      registerCommand(name: string, config: { description: string; handler: Handler }) {
        commands.set(name, config);
      },
    },
  };
}

describe("pi-resume-remind extension", () => {
  it("does not print on non-quit shutdown", async () => {
    const stub = createPiStub();
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    piResumeRemind(stub.pi as never);

    const sessionStart = stub.handlers.get("session_start")?.[0];
    const sessionShutdown = stub.handlers.get("session_shutdown")?.[0];

    await sessionStart?.({}, {
      sessionManager: {
        getSessionFile: () => "/tmp/pi/2026-05-06T03-05-00_019df945-636f-74ad-a36d-aea65e3055b2.jsonl",
        getSessionName: () => "pi-plugins-0506-0305",
      },
    });
    await sessionShutdown?.({ reason: "reload" });

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("prints on quit shutdown", async () => {
    const stub = createPiStub();
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    piResumeRemind(stub.pi as never);

    const sessionStart = stub.handlers.get("session_start")?.[0];
    const sessionShutdown = stub.handlers.get("session_shutdown")?.[0];

    await sessionStart?.({}, {
      sessionManager: {
        getSessionFile: () => "/tmp/pi/2026-05-06T03-05-00_019df945-636f-74ad-a36d-aea65e3055b2.jsonl",
        getSessionName: () => "pi-plugins-0506-0305",
      },
    });
    await sessionShutdown?.({ reason: "quit" });

    expect(spy.mock.calls).toEqual([
      ["To resume session pi-plugins-0506-0305"],
      ["pi --session 019df945-636f-74ad-a36d-aea65e3055b2"],
    ]);
    spy.mockRestore();
  });

  it("registers manual command and prints current snippet", async () => {
    const stub = createPiStub();
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    piResumeRemind(stub.pi as never);

    const sessionStart = stub.handlers.get("session_start")?.[0];
    await sessionStart?.({}, {
      sessionManager: {
        getSessionFile: () => "/tmp/session.jsonl",
        getSessionName: () => "manual-demo",
      },
    });

    const command = stub.commands.get("resume-remind");
    expect(command?.description).toContain("resume snippet");
    await command?.handler("", {});

    expect(spy.mock.calls).toEqual([
      ["To resume session manual-demo"],
      ['pi --session "/tmp/session.jsonl"'],
    ]);
    spy.mockRestore();
  });
});
