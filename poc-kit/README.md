# Eval POC kit

A one-page POC for each of 103 companies: an eval test suite built for that company's kind of AI product,
plus a walkthrough page you can link from an outreach email.

- `data/companies.js`: the companies (name, sector, city, which suite, email hook, one-line POC)
- `data/suites.js`: 8 suites (payments, ordering, support, voice, agent, data, hiring, advice), 88 cases
- `build.mjs`: builds `site/` (index + one page per company)
- `run.mjs`: runs a company's suite against a reference bot (Claude) or your real bot (`BOT_URL`), saves `results/<slug>.json`

## Use

```bash
npm install
node build.mjs                                  # builds site/ (no API key needed)
export ANTHROPIC_API_KEY=...                    # same key as the Dyeus lab
node run.mjs razorpay swiggy                    # ~24 model calls per company
node build.mjs                                  # pages now show real PASS / FAIL results
open site/index.html
```

Test a real bot instead of the reference bot: `BOT_URL=https://.../chat node run.mjs <slug>`
(the endpoint receives `{messages:[{role,content}]}` and returns `{reply}`).

## Deploy (free)

`npx vercel@64.5.0 site --prod` → pages at `https://<your-project>.vercel.app/<slug>/`
