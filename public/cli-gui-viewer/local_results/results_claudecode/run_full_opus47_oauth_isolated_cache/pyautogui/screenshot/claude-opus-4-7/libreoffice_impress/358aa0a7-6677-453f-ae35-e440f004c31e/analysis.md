# libreoffice_impress / 358aa0a7-6677-453f-ae35-e440f004c31e

**Result:** ❌ FAIL  &nbsp;&nbsp; **Reward:** `0`

## Instruction

> Do you have any suggestions on how to modify the font for all text boxes in an Impress presentation? I want to standardize the font to 'Liberation Sans Narrow', but I don't want to manually select each individual text box.

## Run summary

- Turns: **1**, Cost: **$0.088**, Stop reason: `end_turn`
- Agent rc: `0`, trace_lines: 5, screenshot_attached: True
- Timing (s): env_reset=151.7, predict=85.8, evaluate=120.4, total=417.9
- Evaluator: `compare_pptx_files`, postconfig steps: 0
- Tool-use histogram: (none)

## Final agent assertion

```
A few options, in order of how much you'd reach for them:

1. **Master slide edit (View → Master Slide)** — change the font on the master's title/content placeholders. This only affects text that *inherits* from the master, so any text box added manually with overridden fonts won't update.

2. **Tools → Macros (Basic)** — most reliable for "every text box on every slide." A short macro iterates `ThisComponent.DrawPages` → each shape → each paragraph/portion and sets `CharFontName = "Liberation Sans Narrow"`. Want me to write it?

3. **Edit the .odp directly** — .odp is a zip; unzip, run a sed/regex over `content.xml` and `styles.xml` to replace `fo:font-name`/`style:font-name-*` values, rezip. Fast and scriptable, but easy to corrupt the file if you're not careful — keep a backup.

I'd recommend the macro: it's safe, runs against the open document, and handles inherited *and* overridden text. Say the word and I'll write it.
```

## Trajectory (1 steps)

- [#03] **text** — A few options, in order of how much you'd reach for them:  1. **Master slide edit (View → Master Slide)** — change the font on the master's title/content placeholders. This only affects text that *inh

## Stderr tail

```

```