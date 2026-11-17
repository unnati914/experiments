# Agnost AI pitch v3: introduction, five features (evals first), demo

For Shubham Palriwala, Agnost AI. About 60 seconds after speed-up.
Simple English, short lines. Read slowly; the voice gets sped up later. Say "Agnost" clearly: AG-nost.
Say "pull request" clearly (last time it sounded like "bolt request"), and "Hinglish" as one word.
Video theme: same light theme as v1 (white, sky blue, mint, lavender), same music style.
Agnost already replays each fix on past runs, so these five are ideas on top of that, from the outside.
The demo (poc-kit/deploy/agnost-demo) uses sample data and matches every line below.

---

**Introduction**

Hi, I am Unnati. I am an AI engineer with three years of experience.
At Zomato, I built the evaluation framework for GenAI bots used by every app user.
At Paysecure, I built payment systems for forty merchants.
And today, at Grid Dynamics, I build GenAI agents for VISA.

**Why Agnost**

Agnost reads every conversation, finds where the agent fails, and opens a pull request to fix it.
You already test each fix on past runs. I love this.
So I wrote down five features I would add on top, and I built a small demo.

**Five features**

One. Evals that remember.
Every failed conversation becomes a saved test. The test set grows every day, and it never forgets a bug.

Two. A gate on every pull request.
Before a fix is merged, all saved tests run. If something that passed before now fails, the pull request is blocked.

Three. Learn from human handoffs.
When the agent gives up and a human takes over, read what the human said, and turn that answer into the fix.

Four. Test with fake users.
Before a fix goes live, try it on made-up users: an angry one, a confused one, and one who writes in Hinglish.

Five. Every language.
In India, many users write in Hindi, or Hinglish. Group the failures by language, and fix each one.

**Demo**

In my demo, there are twelve sample chats, in English, Hindi and Hinglish.
The failed chats become saved tests, and the failures are grouped by language.
One fix comes from a human handoff. And one bad fix is blocked, because it breaks an old test.
The link is in my email.

**Close**

I have built each of these pieces before.
I would love to join Agnost early, and build them with you. Thank you!
