# Emergent pitch — script (recording 222)

As spoken in recording 222. Words the transcriber misheard are written as intended.

---

Hi, I am Unnati. I am an engineer. I built something small for Emergent.

Emergent builds apps from chat. It works for a lot of people. But when I read reviews from 2026, I saw the same four problems.

One, the agent gets stuck in a loop on its own bug, and every try costs credits.
Two, a fix for one bug breaks something that worked before.
The agent says "done" for a feature it never built.
Four, credits spent on failed work don't come back.

So I built Agent Watch. It watches the build agent while it works.

Here's a demo, with sample data. The user asks for a habit tracker with login, dark mode, and a weekly chart.

Without the guard, the agent loops on a dark mode bug. It fixes, breaks the login, then it says "done", but there is no chart. Twelve credits, and six of them went to fixing its own mistakes.

Now, with Agent Watch. The same fix breaks the login, and the guard rolls it back. The same error comes up three times, so it stops and asks the user one simple question. The agent says "done" again. The guard checks the code again: no chart. So the agent builds it.

Eight credits, and every feature is really there.

I also made twelve test cases for a build agent, like "don't change anything", "deleting user data", and "a deploy that failed, but it says it's live". The agent alone passes two, but the guard passes all twelve. And all these checks are simple rules, so there is no extra cost.

Before this, I built evals for GenAI bots at Zomato, payment systems at Paysecure, and GenAI agents for VISA at Grid Dynamics.

I would love to help Emergent make every credit worth it. So the link is below. Thank you!
