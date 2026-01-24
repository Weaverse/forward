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
  https://raw.githubusercontent.com/hta218/ai-agents-notifier/main/copilot/copilot-cli-notifier.sh
```

### Step 3: Make it executable (macOS/Linux)
```bash
chmod +x ~/.copilot/copilot-cli-notifier.sh
```

### Step 4: Create hooks configuration in your project

**Important:** For Copilot CLI, hooks must be in the **project root** as `hooks.json`, NOT in `.github/hooks/`.

In your project directory:
```bash
cd /path/to/your/project
# Create hooks.json in the project root
```

Create `hooks.json` in your project root (see [settings.example.json](settings.example.json)):

```json
{
  "version": 1,
  "hooks": {
    "sessionStart": [
      {
        "type": "command",
        "bash": "$HOME/.copilot/copilot-cli-notifier.sh",
        "powershell": "$HOME/.copilot/copilot-cli-notifier.sh"
      }
    ],
    "sessionEnd": [
      {
        "type": "command",
        "bash": "$HOME/.copilot/copilot-cli-notifier.sh",
        "powershell": "$HOME/.copilot/copilot-cli-notifier.sh"
      }
    ],
    "preToolUse": [
      {
        "type": "command",
        "bash": "$HOME/.copilot/copilot-cli-notifier.sh",
        "powershell": "$HOME/.copilot/copilot-cli-notifier.sh"
      }
    ],
    "errorOccurred": [
      {
        "type": "command",
        "bash": "$HOME/.copilot/copilot-cli-notifier.sh",
        "powershell": "$HOME/.copilot/copilot-cli-notifier.sh"
      }
    ]
  }
}
```

**Note:** Use `$HOME` instead of `~` for the script path, as the Copilot CLI hook system doesn't expand tilde. Alternatively, you can use the absolute path (e.g., `/Users/yourusername/.copilot/copilot-cli-notifier.sh`).

### Step 5: Test the setup
Run `copilot` and you should see notifications when:
- Session starts 🚀
- Copilot requests permission to use tools 🔔
- Session ends ✅
- Errors occur ⚠️

## Optional Hooks

You can also enable notifications for additional events by adding these to your `hooks-config.json`:

### Notify on every prompt
```json
"userPromptSubmitted": [
  {
    "type": "command",
    "bash": "$HOME/.copilot/copilot-cli-notifier.sh"
  }
]
```

### Note about preToolUse
The `preToolUse` hook notifies you whenever Copilot is about to execute a tool (bash command, file edit, etc.). This is similar to Claude Code's "Notification" hook - it fires at the "permission moment" before Copilot performs actions.

If you find this too noisy, you can remove the `preToolUse` hook from your configuration.

## Customization

Edit `~/.copilot/copilot-cli-notifier.sh` to:
- Change notification messages
- Modify notification sounds
- Enable logging (uncomment the last line in the script)

## Notification Events

The script handles different event types:
- **sessionStart** - "New session started 🚀" / "Session resumed ♻️"
- **sessionEnd** - Different messages based on reason (complete ✅ / error ❌ / timeout ⏱️)
- **preToolUse** - "Permission: [tool] 🔔" (when Copilot is about to use a tool)
- **errorOccurred** - Shows error type ⚠️
- **userPromptSubmitted** - "Prompt submitted 💬" (optional)

## Troubleshooting

If notifications don't appear:
1. Verify terminal-notifier is installed: `which terminal-notifier`
2. Check Terminal has notification permissions in System Settings
3. Test manually: `echo '{"reason":"complete"}' | ~/.copilot/copilot-cli-notifier.sh`
4. Check the debug log: `cat ~/copilot-hook-debug.log`
5. Ensure the hook configuration path uses `$HOME` or absolute path (not `~`)

## References

- [GitHub Copilot Hooks Documentation](https://docs.github.com/en/copilot/reference/hooks-configuration)
- [GitHub Copilot CLI Documentation](https://docs.github.com/copilot/concepts/agents/about-copilot-cli)
