---
title: My AI Workflow
author: Ezekiel
date: 2026-08-29
tags:
  - technical
  - future
layout: ../../layouts/postlayout.astro
description: How do I even really use AI?
visible: true
---

I don't use desktop harnesses. They are clunky, overhyped VS code forks and they usually just increase cognition load.[^1]

I usually use [pi](https://pi.dev) + [DeepSeek](https://deepseek.com/en/)[^2] because pi is minimal and deepseek is cheap.

I have an agents directory where I keep skills and some additional context. Each directory is like a different view for the agent

```
.
├── planify
│   └── PLANIFY.md
├── project-idea-finder
│   ├── docs
│   │   └── product-idea.md
│   ├── form.md
│   ├── INSTRUCTIONS.md
│   ├── PLAN.md
│   └── skills-lock.json
└── resume-writer
```

Personally (_and this may vary_), a session costs around $0.01 on average. I usually insert guides which reduces the amount of work the agent has to do.

I am also a coder, if there is an error, I'd rather go in and fix it myself than create a new session[^3].

A terminal is text-based, therefore I believe a terminal is the best way for an agent to interact with software.

Any app that you must build should have a CLI (_its highly recommended_) and an accompanying skill.

That's it folks, I'll keep it updated.

And No, AI is not replacing Software Engineers.

Just be good at what you do.


[^1]: Though the best thing about GUI is diffs, I'm not changing my mind.
[^2]: If you take into account where I live, the dollar is a bit more expensive than it's meant to be
[^3]: A way for me to actually understand what I am building
