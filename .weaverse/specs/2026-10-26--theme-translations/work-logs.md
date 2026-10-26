# Work Logs

## 2026-10-26 — @hta218
- Opened #111 and Weaverse/docs#104.
- Moved the copy to `src/translations/en.json` and added German, French and Japanese bundles (288 keys each; a script and the new test confirm key and placeholder parity).
- `useTranslation()` does not expose `staticContent`, so `useT()` reads the market's copy from a small context that `WeaverseRoot` provides, fed by the layout on the server.
- The DOM harness now mirrors the layout (`staticContent={themeContent(locale)}`); one DOM test that expected English for an un-overridden German sort option now expects the bundle (`Empfohlen`).
