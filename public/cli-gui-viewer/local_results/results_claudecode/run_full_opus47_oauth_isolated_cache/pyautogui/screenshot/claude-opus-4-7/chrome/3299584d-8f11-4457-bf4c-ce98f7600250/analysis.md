# chrome / 3299584d-8f11-4457-bf4c-ce98f7600250

**Result:** ❌ FAIL  &nbsp;&nbsp; **Reward:** `0.0`

## Instruction

> On my surface pro whenever I launch Chrome it always opens "funbrain.com." I don't want this. I cleared my cache but it still happens. What should I do?

## Run summary

- Turns: **1**, Cost: **$0.093**, Stop reason: `end_turn`
- Agent rc: `0`, trace_lines: 5, screenshot_attached: True
- Timing (s): env_reset=146.9, predict=131.1, evaluate=62.7, total=400.7
- Evaluator: `exact_match`, postconfig steps: 0
- Tool-use histogram: (none)

## Final agent assertion

```
This is almost always a Chrome startup-page setting (or a hijacker extension), not something a cache clear will fix. Try this in order:

1. **Check startup pages**: Chrome → ⋮ menu → **Settings → On startup**. If "Open a specific page or set of pages" is selected and lists funbrain.com, switch to "Open the New Tab page" (or remove the funbrain entry).

2. **Check the homepage**: Settings → **Appearance → Show home button**. If funbrain.com is set there, clear or change it.

3. **Check the default search engine**: Settings → **Search engine → Manage search engines**. Make sure the default isn't a funbrain redirector, and remove any unfamiliar entries.

4. **Check extensions**: ⋮ → Extensions → Manage Extensions. Disable anything you don't recognize — browser hijackers often install as an extension and force a startup URL.

5. **Check the Chrome desktop/taskbar shortcut**: Right-click the Chrome icon → **Properties → Shortcut tab → Target**. It should end with `chrome.exe"` — nothing after it. If there's a URL like `... chrome.exe" https://funbrain.com` appended, delete that part. (This is a very common cause and is invisible from inside Chrome.) Do the same for any pinned taskbar shortcut.

6. **Scan for unwanted software**: Settings → **Reset and clean up → Clean up computer** (Windows only) → Find. This catches hijackers that survive the steps above.

7. **Last resort**: Settings → **Reset and clean up → Restore settings to their original defaults**. This resets startup page
```

## Trajectory (1 steps)

- [#03] **text** — This is almost always a Chrome startup-page setting (or a hijacker extension), not something a cache clear will fix. Try this in order:  1. **Check startup pages**: Chrome → ⋮ menu → **Settings → On s

## Stderr tail

```

```