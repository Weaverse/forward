# GitHub Copilot CLI Notifications Setup

GitHub Copilot CLI supports native hooks configuration. Follow these steps to enable notifications.

## Installation

### Step 1: Install terminal-notifier (macOS only)
```bash
brew install terminal-notifier
```

**Note**: For Linux, `notify-send` is usually pre-installed. For Windows, PowerShell notifications are built-in.

### Step 2: Download the notification script
```bash
curl -o ~/.copilot/copilot-cli-notifier.sh \
  https://raw.githubusercontent.com/hta218/claude-code-notifier/main/copilot-cli-notifier.sh
```

### Step 3: Make it executable (macOS/Linux)
```bash
chmod +x ~/.copilot/copilot-cli-notifier.sh
```

### Step 4: Create hooks configuration
Create or edit `~/.copilot/hooks-config.json` (see [settings.example.json](settings.example.json)):

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

### Step 5: Test the setup
Run `copilot` and you should see notifications when:
- Session starts 🚀
- Session ends ✅
- Errors occur ⚠️

## Optional Hooks

You can also enable notifications for additional events by adding these to your `hooks-config.json`:

### Notify on every prompt
```json
"userPromptSubmitted": [
  {
    "type": "command",
    "bash": "~/.copilot/copilot-cli-notifier.sh"
  }
]
```

## Customization

Edit `~/.copilot/copilot-cli-notifier.sh` to:
- Change notification messages
- Modify notification sounds
- Enable logging (uncomment the last line in the script)

## Notification Events

The script handles different event types:
- **sessionStart** - "New session started 🚀" / "Session resumed ♻️"
- **sessionEnd** - Different messages based on reason (complete ✅ / error ❌ / timeout ⏱️)
- **errorOccurred** - Shows error type ⚠️
- **userPromptSubmitted** - "Prompt submitted 💬"

## Troubleshooting

If notifications don't appear:
1. Verify terminal-notifier is installed: `which terminal-notifier`
2. Check Terminal has notification permissions in System Settings
3. Test manually: `echo '{"source":"new"}' | COPILOT_HOOK_TYPE=sessionStart ~/.copilot/copilot-cli-notifier.sh`
4. Check the hook configuration path is correct

## References

- [GitHub Copilot Hooks Documentation](https://docs.github.com/en/copilot/reference/hooks-configuration)
- [GitHub Copilot CLI Documentation](https://docs.github.com/copilot/concepts/agents/about-copilot-cli)
