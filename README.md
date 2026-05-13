# pi-resume-remind

Pi CLI extension that reminds users how to resume the current session when quitting.

When a user types `exit`, `quit`, or closes a pi session, this extension displays a reminder with the exact command to resume that session later.

## Features

- **Quit reminder** — shows resume command when user exits a session
- **`/resume` command** — displays how to resume the current session at any time
- **Configurable** — customize reminder format and behavior
- **Zero-config** — works out of the box with sensible defaults

## Install

Add to your pi `settings.json` packages array:

```json
{
  "packages": ["https://github.com/buihongduc132/pi-resume-remind"]
}
```

Or install locally:

```bash
git clone https://github.com/buihongduc132/pi-resume-remind.git
# Then reference the local path in settings.json
```

## Configuration

No configuration required. The extension works automatically on session end.

Optional config in `~/.pi/config.toml`:

```toml
[pi-resume-remind]
enabled = true
```

## Usage

The extension hooks into pi's session lifecycle automatically:

1. **On session start** — captures the session ID
2. **On quit** — displays: `Resume this session with: pi -s <session-id>`
3. **`/resume` command** — shows the resume command for the current session at any time

## Architecture

```
src/
├── index.ts          # Extension entry point, hooks registration
├── resume.ts         # Resume command logic and session tracking
└── commands.ts       # Slash command definitions
```

## Development

```bash
npm install
npm run check    # typecheck + test
npm run test     # run tests with coverage
```

## License

MIT © buihongduc132
