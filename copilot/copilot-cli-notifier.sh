#!/bin/bash

#==============================================================================
# GitHub Copilot CLI Notification Hook Script
# This script displays system notifications when Copilot CLI triggers hooks
#==============================================================================

# Read JSON input from stdin
input=$(cat)

# Detect hook type from JSON payload structure since COPILOT_HOOK_TYPE is not set
if echo "$input" | jq -e '.source' >/dev/null 2>&1; then
  hook_type="sessionStart"
elif echo "$input" | jq -e '.reason' >/dev/null 2>&1; then
  hook_type="sessionEnd"
elif echo "$input" | jq -e '.prompt' >/dev/null 2>&1; then
  hook_type="userPromptSubmitted"
elif echo "$input" | jq -e '.toolName' >/dev/null 2>&1; then
  if echo "$input" | jq -e '.toolResult' >/dev/null 2>&1; then
    hook_type="postToolUse"
  else
    hook_type="preToolUse"
  fi
elif echo "$input" | jq -e '.error' >/dev/null 2>&1; then
  hook_type="errorOccurred"
else
  hook_type="unknown"
fi

# Extract fields from JSON input using jq
timestamp=$(echo "$input" | jq -r '.timestamp // empty')
cwd=$(echo "$input" | jq -r '.cwd // empty')

# Default message
message="Copilot CLI Notification"

#==============================================================================
# Customize message based on hook type
#==============================================================================
case "$hook_type" in
  "sessionStart")
    source=$(echo "$input" | jq -r '.source // "new"')
    case "$source" in
      "new")
        message="New session started 🚀"
        ;;
      "resume")
        message="Session resumed ♻️"
        ;;
      "startup")
        message="Copilot CLI started ⚡"
        ;;
      *)
        message="Session started 🚀"
        ;;
    esac
    ;;
    
  "sessionEnd")
    reason=$(echo "$input" | jq -r '.reason // "unknown"')
    case "$reason" in
      "complete")
        message="Session completed ✅"
        ;;
      "error")
        message="Session ended with errors ❌"
        ;;
      "abort")
        message="Session aborted 🛑"
        ;;
      "timeout")
        message="Session timed out ⏱️"
        ;;
      "user_exit")
        message="Session exited 👋"
        ;;
      *)
        message="Session ended"
        ;;
    esac
    ;;
    
  "userPromptSubmitted")
    prompt=$(echo "$input" | jq -r '.prompt // empty')
    # Don't show the full prompt, just notify
    message="Prompt submitted 💬"
    ;;
    
  "preToolUse")
    tool_name=$(echo "$input" | jq -r '.toolName // "unknown"')
    # Extract command preview if it's a bash tool
    if [ "$tool_name" = "bash" ]; then
      command=$(echo "$input" | jq -r '.toolArgs' | jq -r '.command // empty' 2>/dev/null | head -c 50)
      if [ -n "$command" ]; then
        message="Permission: Run command 🔔"
      else
        message="Permission: ${tool_name} 🔔"
      fi
    else
      message="Permission: ${tool_name} 🔔"
    fi
    ;;
    
  "errorOccurred")
    error_msg=$(echo "$input" | jq -r '.error.message // "Unknown error"')
    error_name=$(echo "$input" | jq -r '.error.name // "Error"')
    message="Error: $error_name ⚠️"
    ;;
    
  *)
    message="Copilot CLI: $hook_type"
    ;;
esac

#==============================================================================
# Detect operating system and show notification accordingly
#==============================================================================
case "$(uname -s)" in
  Darwin*)
    # macOS - use terminal-notifier
    if command -v terminal-notifier >/dev/null 2>&1; then
      terminal-notifier -title "GitHub Copilot CLI" -message "$message" -sound default
    else
      echo "Copilot CLI: $message"
    fi
    ;;
    
  Linux*)
    # Linux - use notify-send
    if command -v notify-send >/dev/null 2>&1; then
      notify-send "GitHub Copilot CLI" "$message" -i dialog-information
    else
      echo "Copilot CLI: $message"
    fi
    ;;
    
  CYGWIN*|MINGW*|MSYS*)
    # Windows - use PowerShell toast notification
    powershell.exe -Command "
    [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null;
    [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null;
    \$template = @'
    <toast>
        <visual>
            <binding template=\"ToastGeneric\">
                <text>GitHub Copilot CLI</text>
                <text>$message</text>
            </binding>
        </visual>
    </toast>
'@;
    \$xml = New-Object Windows.Data.Xml.Dom.XmlDocument;
    \$xml.LoadXml(\$template);
    \$toast = [Windows.UI.Notifications.ToastNotification]::new(\$xml);
    [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('GitHub Copilot CLI').Show(\$toast);"
    ;;
    
  *)
    # Fallback - just echo to terminal
    echo "Copilot CLI Notification: $message"
    ;;
esac

# Optional: Log to file (uncomment to enable)
# echo "$(date): [$hook_type] $message" >> ~/.copilot/notifications.log

exit 0
