# Claude Code Setup

## Installation

### Step 1: Install terminal-notifier (macOS only)
```bash
brew install terminal-notifier
```

### Step 2: Create the script file
```bash
curl -o ~/.claude/claude-code-notifier.sh \
  https://raw.githubusercontent.com/hta218/claude-code-notifier/main/claude/claude-code-notifier.sh
```

### Step 3: Make it executable (macOS/Linux)
```bash
chmod +x ~/.claude/claude-code-notifier.sh
```
**Note**: Windows users can skip this step.

### Step 4: Enable notifications on your system
Make sure notifications are enabled for Terminal/your shell application in your system settings.

### Step 5: Add configuration to Claude settings
Create or edit `~/.claude/settings.json` (see [settings.example.json](settings.example.json)):
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

## Testing

Test manually:
```bash
echo '{"message":"Test notification","hook_event_name":"Notification"}' | ./claude/claude-code-notifier.sh
```
