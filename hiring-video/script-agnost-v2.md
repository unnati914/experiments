# Agnost AI pitch v2: introduction, then five features (evals + demo)

For Shubham Palriwala, Agnost AI. About 60 seconds after speed-up.
Simple English, short lines. Read slowly; the voice gets sped up later. Say "Agnost" clearly: AG-nost.
Say "pull request" clearly (last time it sounded like "bolt request"), and "Hinglish" as one word.
Video theme: same light theme as v1 (white, sky blue, mint, lavender), same music style.
Changed from v1: Agnost already replays fixes on past runs, so "Prove the fix" is gone.
These five are gaps: saved evals, a regression gate, languages, missing knowledge, and tests from one click.

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

Three. Every language.
In India, many users write in Hindi, or Hinglish. Group the failures by language, and fix each one.

Four. Find the missing knowledge.
Sometimes the prompt is fine, but the answer is not in the agent's documents. The pull request adds the missing document, or fixes the search.

Five. One click to a test.
Any person on the team can open a bad conversation, and turn it into a new test, with one click.

**Demo**

I built a small demo with twelve sample chats, in English, Hindi and Hinglish.
It groups the failures by language, finds the missing document, and blocks a fix that breaks an old test.
The link is in my email.

**Close**

I have built each of these pieces before.
I would love to join Agnost early, and build them with you. Thank you!
