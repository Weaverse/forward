# AI Code Assistant Notifications

📢 Send system notifications for Claude Code and GitHub Copilot CLI events

A cross-platform notification system that integrates with AI coding assistants to show desktop notifications for sessions, completions, and permission requests.

## Supported AI Tools

- **Claude Code** - Native hook integration
- **GitHub Copilot CLI** - Shell wrapper integration

## Installation

### For Claude Code

See detailed instructions in [claude/SETUP.md](claude/SETUP.md)

#### Quick Start
```bash
curl -o ~/.claude/claude-code-notifier.sh \
  https://raw.githubusercontent.com/hta218/claude-code-notifier/main/claude/claude-code-notifier.sh
chmod +x ~/.claude/claude-code-notifier.sh
```

Then configure hooks in `~/.claude/settings.json` - see [claude/SETUP.md](claude/SETUP.md) for full configuration.

---

### For GitHub Copilot CLI

See detailed instructions in [copilot/SETUP.md](copilot/SETUP.md)

#### Quick Start
```bash
curl -o ~/.copilot/copilot-cli-notifier.sh \
  https://raw.githubusercontent.com/hta218/claude-code-notifier/main/copilot/copilot-cli-notifier.sh
chmod +x ~/.copilot/copilot-cli-notifier.sh
```

Then configure hooks in `~/.copilot/hooks-config.json` - see [copilot/SETUP.md](copilot/SETUP.md) and [copilot/hooks-config.example.json](copilot/hooks-config.example.json).

---
```bash
brew install terminal-notifier
```

### Step 2: Create the script file
```bash
curl -o ~/.claude/claude-code-notifier.sh https://raw.githubusercontent.com/hta218/claude-code-notifier/main/claude-code-notifier.sh
```

### Step 3: Make it executable (macOS/Linux)
```bash
chmod +x ~/.claude/claude-code-notifier.sh
```
**Note**: Windows users can skip this step.

### Step 4: Enable notifications on your system
Make sure notifications are enabled for Terminal/your shell application in your system settings.

![Enable Terminal Notifications](https://cdn.shopify.com/s/files/1/0669/0262/2504/files/terminal-notifier.png?v=1756888696)

### Step 5: Add configuration to Claude settings
Create or edit `~/.claude/settings.json` and add:
```json
{
  "hooks": {
    "Notification": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/claude-code-notifier.sh"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/claude-code-notifier.sh"
          }
        ]
      }
    ],
    "SessionEnd": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/claude-code-notifier.sh"
          }
        ]
      }
    ],
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/claude-code-notifier.sh"
          }
        ]
      }
    ]
  }
}
```

### Step 6: Restart Claude Code
Restart Claude Code to apply the changes then simply prompt 'Hello' to see notifications in action.

---

### For GitHub Copilot CLI

Copilot CLI supports native hooks configuration.

#### Step 1: Install terminal-notifier (macOS only)
```bash
brew install terminal-notifier
```

#### Step 2: Download the script
```bash
curl -o ~/.copilot/copilot-cli-notifier.sh \
  https://raw.githubusercontent.com/hta218/claude-code-notifier/main/copilot-cli-notifier.sh
chmod +x ~/.copilot/copilot-cli-notifier.sh
```

#### Step 3: Create hooks configuration
Create or edit `~/.copilot/hooks-config.json` (see [hooks-config.example.json](hooks-config.example.json)):

```json
{
  "version": 1,
  "hooks": {
    "sessionStart": [
      {
        "type": "command",
        "bash": "~/.copilot/copilot-cli-notifier.sh",
        "powershell": "~/.copilot/copilot-cli-notifier.sh"
      }
    ],
    "sessionEnd": [
      {
        "type": "command",
        "bash": "~/.copilot/copilot-cli-notifier.sh",
        "powershell": "~/.copilot/copilot-cli-notifier.sh"
      }
    ],
    "errorOccurred": [
      {
        "type": "command",
        "bash": "~/.copilot/copilot-cli-notifier.sh",
        "powershell": "~/.copilot/copilot-cli-notifier.sh"
      }
    ]
  }
}
```

See [COPILOT_SETUP.md](COPILOT_SETUP.md) for more details and optional hooks.

---

## Usage

### Claude Code Usage

### Claude Code Usage

Once installed, the script will automatically trigger notifications with default System sounds when Claude Code:
- Starts sessions (SessionStart hook)
- Requests permissions or user input (Notification hook)
- Completes tasks or responses (Stop hook)
- Ends sessions (SessionEnd hook)

![Notification Preview](https://cdn.shopify.com/s/files/1/0669/0262/2504/files/terminal-notifier-noties.png?v=1756889242)

### Copilot CLI Usage

Once hooks are configured, notifications appear automatically when you:
- Start a Copilot CLI session → "New session started 🚀"
- Resume a session → "Session resumed ♻️"
- Complete successfully → "Session completed ✅"
- Exit with errors → "Session ended with errors ❌"
- Encounter errors → "Error: [error type] ⚠️"

## Event Types

### Claude Code Events

### Claude Code Events

The claude-code-notifier.sh script handles different notification types:

- **SessionStart**: Shows "Session started 🚀"
- **SessionEnd**: Shows "Session completed ✅"
- **Stop**: Shows "Response finished 🏁"  
- **Notification**: Shows the original message from Claude
- **Other events**: Shows the event name with the message

### Copilot CLI Events

The copilot-cli-notifier.sh script handles:
- **sessionStart** - "New session started 🚀" / "Session resumed ♻️" / "Copilot CLI started ⚡"
- **sessionEnd** - Different messages based on reason:
  - complete → "Session completed ✅"
  - error → "Session ended with errors ❌"
  - abort → "Session aborted 🛑"
  - timeout → "Session timed out ⏱️"
  - user_exit → "Session exited 👋"
- **errorOccurred** - "Error: [error type] ⚠️"
- **userPromptSubmitted** (optional) - "Prompt submitted 💬"

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

You can modify the script to:
- Change notification messages
- Add different sounds
- Log notifications to a file (uncomment the last line)
- Customize notification appearance

## Contributing

Feel free to submit issues and pull requests to improve the script!
