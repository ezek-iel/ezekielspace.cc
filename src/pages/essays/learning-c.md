---
title: "Learning C"
author: "Ezekiel"
date: 2026-05-18
tags: ["Technology", "Coding"]
layout: "../../layouts/postlayout.astro"
description: "What I cannot create, I do not understand.— Richard Feynman"
visible: true
---

I've been on a trip down the computing rabbit-hole. From handling UTF-8 to syntax parsing and memory management.

Why you might ask? Its a lot of fun. By the way, AI has made the learning process so much better.

I began by reading the C Book (_which I am still reading btw_), The 2nd (ANSI) edition to be exact.

__What did I realize when learning the C programming language?__

- Language design is a lot of work. The folks behind high level languages like go, python and ruby put in a lot of work when representing strings. Resizable arrays are not easy to represent in a memory of fixed size.

- Everything is a number, from the memory address on your laptop where the time is kept (_in `int64`_) to the values on your Command Line AI chat app.

- C is very minimal. There is about 6-8 modules in the standard library. Python has around  40. This is because, most of the operations in C depend on the machine C runs on, rather than the language itself. C runs everywhere, on almost everything (_not Java_).

- The exercises were simple but hard. You need to think with constraints to solve some of the questions. Constraints about fixed array sizes, look-ahead buffer and OS memory management.

Learning C is a great way to appreciate python, go and rust ecosystems. This is because of the amount of work put into developing great developer tooling abstracting unneccessary underlying complexities.