# libreoffice_impress / 0f84bef9-9790-432e-92b7-eece357603fb

**Result:** ❌ FAIL  &nbsp;&nbsp; **Reward:** `0.0`

## Instruction

> On it Whenever I launch a LibreOffice Impress, it uses both screens, one for current slide and next slide and another for actual presentation. What I want is to use only one monitor which shows presentation. I dont want the screen with Current slide and Next slide so that it can be used for other purposes. How should I achieve this?

## Run summary

- Turns: **1**, Cost: **$0.094**, Stop reason: `end_turn`
- Agent rc: `0`, trace_lines: 5, screenshot_attached: True
- Timing (s): env_reset=127.1, predict=79.4, evaluate=189.5, total=456.0
- Evaluator: `check_presenter_console_disable`, postconfig steps: 0
- Tool-use histogram: (none)

## Final agent assertion

```
To stop LibreOffice Impress from using the Presenter Console (the view with current slide + next slide) and only show the presentation on one monitor, do this:

**Option 1 — Disable Presenter Console entirely (recommended)**

1. In Impress, go to **Tools → Options**
2. Expand **LibreOffice Impress → General**
3. Under the **Presentation** section, uncheck **"Enable Presenter Console"**
4. Click **OK**

**Option 2 — Per-presentation, choose which display**

1. Go to **Slide Show → Slide Show Settings** (or **Slide Show Properties**)
2. Under **Multiple Displays**, set **Presentation Display** to the specific monitor you want to use
3. Make sure **"Presenter Console"** is set to **"Disabled"** (or untick it)
4. Click **OK**

After Option 1, the next time you press **F5** to start the show, it will only display fullscreen on the chosen monitor — the other monitor stays on your desktop and is free to use for other apps (browser, notes, etc.).

If the second monitor still gets covered, also check **Slide Show → Slide Show Settings → Multiple Displays** and explicitly pick the target monitor (instead of "All displays").
```

## Trajectory (1 steps)

- [#03] **text** — To stop LibreOffice Impress from using the Presenter Console (the view with current slide + next slide) and only show the presentation on one monitor, do this:  **Option 1 — Disable Presenter Console 

## Stderr tail

```

```