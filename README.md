# pi-resume-remind

[![npm version](https://img.shields.io/npm/v/pi-resume-remind.svg)](https://www.npmjs.com/package/pi-resume-remind)
[![license](https://img.shields.io/npm/l/pi-resume-remind.svg)](./LICENSE)

A [pi](https://pi.dev) extension that reminds users how to resume the current session when quitting.

When a user types `exit`, `quit`, or closes a pi session, this extension displays the exact command to resume that session later — no fumbling through session lists.

## Features

- **Session resume reminders** — displays the resume command on quit so you never lose a session
- **Idle detection awareness** — caches session state at startup for reliable quit-time output
- **Context recovery** — UUID-based, path-based, and ephemeral session fallback handling
- **Session handoff** — `/resume-remind` command shows the resume snippet at any time mid-session
- **Zero-config** — works out of the box, no configuration required
- **Non-blocking** — hooks never block shutdown; exceptions are caught and silently handled

## Installation

### For Humans

```bash
pi install npm:pi-resume-remind
```

### For AI Agents

Add to `~/.pi/agent/settings.json`:

```json
{
  "packages": ["npm:pi-resume-remind"]
}
```

Agent prompt reference: `https://github.com/buihongduc132/pi-resume-remind/blob/main/README.md`

### For pi git-sourced

Add to `~/.pi/agent/settings.json`:

```json
{
  "packages": ["https://github.com/buihongduc132/pi-resume-remind"]
}
```

## Usage

The extension hooks into pi's session lifecycle automatically:

1. **On session start** — captures the session file path and name
2. **On quit** — displays:
   ```
   To resume session my-project-session
   pi --session 019df945-636f-74ad-a36d-aea65e3055b2
   ```
3. **`/resume-remind` command** — shows the resume command for the current session at any time

## Configuration

No configuration required. The extension works automatically on session end.

To disable, add to `~/.pi/config.toml`:

```toml
[pi-resume-remind]
enabled = false
```

## Architecture

```
src/
├── index.ts          # Extension entry point, hook registration
├── resume.ts         # Session UUID extraction, resume command formatting
└── commands.ts       # /resume-remind slash command
```

Session state is cached at `session_start` and read (never re-fetched) at `session_shutdown` to avoid blocking on stale or destroyed context.

## Development

```bash
npm install
npm run check         # typecheck + test
npm run test          # run tests with coverage
npm pack --dry-run    # verify publish contents
```

## License

[MIT](./LICENSE) © [buihongduc132](https://github.com/buihongduc132)
