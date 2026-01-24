# AI Code Assistant Notifications

📢 Send system notifications for Claude Code and GitHub Copilot CLI events

A cross-platform notification system that integrates with AI coding assistants to show desktop notifications for sessions, completions, and permission requests.

## Supported AI Tools

- **Claude Code** - Native hook integration
- **GitHub Copilot CLI** - Native hook integration

## Installation

### Claude Code

📖 **[See claude/SETUP.md for installation instructions](claude/SETUP.md)**

Quick start:
```bash
curl -o ~/.claude/claude-code-notifier.sh \
  https://raw.githubusercontent.com/hta218/claude-code-notifier/main/claude/claude-code-notifier.sh
chmod +x ~/.claude/claude-code-notifier.sh
```

Then configure `~/.claude/settings.json` - see [claude/settings.example.json](claude/settings.example.json)

---

### GitHub Copilot CLI

📖 **[See copilot/SETUP.md for installation instructions](copilot/SETUP.md)**

Quick start:
```bash
curl -o ~/.copilot/copilot-cli-notifier.sh \
  https://raw.githubusercontent.com/hta218/claude-code-notifier/main/copilot/copilot-cli-notifier.sh
chmod +x ~/.copilot/copilot-cli-notifier.sh
```

Then configure `~/.copilot/hooks-config.json` - see [copilot/settings.example.json](copilot/settings.example.json)

---

## Usage

### Claude Code

📖 **[See claude/SETUP.md](claude/SETUP.md)**

Notifications appear for:
- SessionStart → "Session started 🚀"
- SessionEnd → "Session completed ✅"
- Stop → "Response finished 🏁"
- Notification → Original message from Claude

![Notification Preview](https://cdn.shopify.com/s/files/1/0669/0262/2504/files/terminal-notifier-noties.png?v=1756889242)

---

### GitHub Copilot CLI

📖 **[See copilot/SETUP.md](copilot/SETUP.md)**

Notifications appear for:
- sessionStart → "New session started 🚀" / "Session resumed ♻️"
- sessionEnd → "Session completed ✅" / "Session ended with errors ❌"
- preToolUse → "Permission: [tool] 🔔" (when about to execute)
- errorOccurred → "Error: [error type] ⚠️"

---

## Requirements

### macOS (recommended)
- [`terminal-notifier`](https://github.com/julienXX/terminal-notifier) for pushing notifications
- [`jq`](https://github.com/jqlang/jq) for JSON processing
- Install: `brew install terminal-notifier jq`

### Linux
- `notify-send` (usually pre-installed)
- Install if missing: `sudo apt install libnotify-bin`

### Windows
- PowerShell (built-in on modern Windows)
- Uses Windows Toast notifications

## Customization

See each agent's SETUP.md for customization options:
- [claude/SETUP.md](claude/SETUP.md)
- [copilot/SETUP.md](copilot/SETUP.md)

## Contributing

Feel free to submit issues and pull requests to improve the script!

