# First Day on Flask

An unofficial proof of concept built on [Repowise](https://github.com/repowise-dev/repowise)'s open-source codebase index.

A new engineer's first questions are the ones a coding agent asks: what breaks if I touch this, what usually changes with it, which tests to run, who to ask. This page answers them from a real Repowise index of [pallets/flask](https://github.com/pallets/flask). It was built with no model and no API key.

- **Onboarding quest.** Eight rounds generated from the index, so every play is different. Before you answer, you say whether you're sure or guessing, and the score counts "sure and wrong" answers. Each reveal shows the Repowise MCP call that returns the same fact.
- **Change preview.** Pick the files you plan to change. You get a plain-English risk card (dependents, co-change partners missing from the change, tests to run first, owners, fragile code) and a PR comment you can copy.
- **How it's built.** The commands, the tables used, and the caveats.

## Rebuild the data

```bash
uv tool install repowise          # on macOS 14 add: --with 'tree-sitter-language-pack==1.23.1'
git clone https://github.com/pallets/flask target/flask
cd target/flask && repowise init --yes --no-prose --no-editor-setup --no-hook && cd ../..
python3 scripts/export.py target/flask data.json
```

Then serve the folder with any static server (`python3 -m http.server`).

## Files

| File | What it is |
|---|---|
| `index.html` | Page shell and styles |
| `app.js` | Quest round generators, scoring, change preview |
| `data.json` | File-level facts exported from `.repowise/wiki.db` |
| `scripts/export.py` | The exporter (reads SQLite, no network) |

Not affiliated with Repowise. Flask is BSD-3. Repowise is AGPL-3.0, and none of its code is included here.
