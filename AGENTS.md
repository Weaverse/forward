# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Claude Code notification system that provides cross-platform system notifications for Claude Code events. The project consists of a shell script (`claude-code-notifier.sh`) that integrates with Claude Code hooks to display notifications when various events occur.

## Key Components

- **claude-code-notifier.sh**: Main notification script that handles cross-platform notification display
  - Supports macOS (via terminal-notifier), Linux (via notify-send), and Windows (via PowerShell toast notifications)
  - Processes JSON input from Claude Code hooks
  - Customizes notification messages based on event types (SessionStart, SessionEnd, Stop, Notification)

## Dependencies

### macOS
- `terminal-notifier`: Install via `brew install terminal-notifier`
- `jq`: Install via `brew install jq`

### Linux
- `notify-send`: Usually pre-installed, install via `sudo apt install libnotify-bin` if missing

### Windows
- PowerShell (built-in on modern Windows)

## Configuration

The script is designed to be placed in `~/.claude/claude-code-notifier.sh` and configured in Claude Code's `~/.claude/settings.json` with hooks for:
- SessionStart
- SessionEnd  
- Stop
- Notification

## Testing

To test the notification script manually:
```bash
echo '{"message":"Test notification","hook_event_name":"Notification"}' | ./claude-code-notifier.sh
```

## Architecture

The script follows a simple event-driven architecture:
1. Reads JSON input from stdin containing message and hook event data
2. Processes the event type to customize the notification message
3. Detects the operating system and uses the appropriate notification system
4. Falls back to terminal echo if no notification system is available

The script is platform-agnostic and handles OS detection automatically, making it suitable for cross-platform deployment.