# agent.md

This file provides guidance to AI coding assistants when working with code in this repository.

## Project Overview

This is an AI coding assistant notification system that provides cross-platform system notifications for AI coding events. The project includes:
- `claude-code-notifier.sh` - Integrates with Claude Code hooks
- `copilot-cli-notifier.sh` - Wrapper for GitHub Copilot CLI notifications

## Key Components

- **claude-code-notifier.sh**: Claude Code notification script
  - Integrates with Claude Code native hooks via ~/.claude/settings.json
  - Processes JSON input from hooks
  - Event types: SessionStart, SessionEnd, Stop, Notification

- **copilot-cli-notifier.sh**: GitHub Copilot CLI notification script
  - Integrates with Copilot CLI native hooks via ~/.copilot/hooks-config.json
  - Reads $COPILOT_HOOK_TYPE environment variable
  - Event types: sessionStart, sessionEnd, errorOccurred, userPromptSubmitted
  
Both scripts support macOS (terminal-notifier), Linux (notify-send), and Windows (PowerShell toast)

## Dependencies

### macOS
- `terminal-notifier`: Install via `brew install terminal-notifier`
- `jq`: Install via `brew install jq`

### Linux
- `notify-send`: Usually pre-installed, install via `sudo apt install libnotify-bin` if missing

### Windows
- PowerShell (built-in on modern Windows)

## Configuration

### Claude Code
The script is placed in `~/.claude/claude-code-notifier.sh` and configured in `~/.claude/settings.json` with hooks for:
- SessionStart, SessionEnd, Stop, Notification

### Copilot CLI
The script is placed in `~/.copilot/copilot-cli-notifier.sh` and configured in `~/.copilot/hooks-config.json` with hooks for:
- sessionStart, sessionEnd, errorOccurred, userPromptSubmitted (optional)

## Testing

### Claude Code
To test the Claude Code notification script manually:
```bash
echo '{"message":"Test notification","hook_event_name":"Notification"}' | ./claude-code-notifier.sh
```

### Copilot CLI
To test the Copilot CLI notification script manually:
```bash
echo '{"source":"new"}' | COPILOT_HOOK_TYPE=sessionStart ./copilot-cli-notifier.sh
```

## Architecture

The script follows a simple event-driven architecture:
1. Reads JSON input from stdin containing message and hook event data
2. Processes the event type to customize the notification message
3. Detects the operating system and uses the appropriate notification system
4. Falls back to terminal echo if no notification system is available

The script is platform-agnostic and handles OS detection automatically, making it suitable for cross-platform deployment.