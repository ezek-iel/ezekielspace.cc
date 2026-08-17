---
title: "I Googled my Site and Found Nothing"
author: "Ezekiel"
date: 2026-08-13
tags: ["Technology", "AI", "Marketing", "SEO"]
layout: "../../layouts/postlayout.astro"
description: "Writing into the void isn't fun"
visible: true
---

Something I really dislike doing when building new websites is __SEO__. It sounds more like marketing stuff than actual technology.

I also dislike how websites with mediocre content hack search engine listings. Then when people search for something important (_those days_), it's literally ads disguised as blogposts that will pop up.

Well, a few days ago, I decided to check my name online, A quick "Ezekiel Akinfenwa" in Google search on a private tab.[^1]

I was happy that other profiles such as LinkedIn, GitHub and Peerlist were among the first five listings.

Even AI search suggested my name with all the links. Pretty cool.

One thing was not cool though, my [website](https://ezekielspace.cc) wasn't part of it. That is a very big deal.

I decided to do something about it. or...,
...AI did something about it.

I am no SEO professional so I delegated this one to AI, and besides,  
AI has gotten really good now, so it shouldn't really be an issue for it (_i mean us_).

In the terminal, l installed pi (_minimal agent harness_), and connected it to the Deepseek API (_which I paid for_).

I have been hearing about skills all around me, in my emails, BlueSky, YouTube and GitHub explore pages. So, i decided to try it out.

I visited the skill repository to install all the necessary skills needed.[^2] I found out the seo-audit[^3] and astro skills[^4].

Then, I gave pi this prompt.[^5]

```
Use the seo-audit skill to do a thorough seo assessment of my site. you can use the astro skill to find how the site was being developed since it was built using astro  
v7. Write all responses to a SEO.md file in the tld                  
```

tld means __Top Level Directory__ (_hopefully, AI understands that_).

Pi decided to do 3 things,
- Check the website code, which was local (_obviously_)
- Build the website using `pnpm build` to see how the website files look on the server using the `dist` directory.
- Send web requests to the actual `ezekielspace.cc` server to mimic client lookups.

It then compared its result to the framework presented in the `seo-audit` skill.

It created a super long [`SEO.md`](https://github.com/ezek-iel/ezekielspace.cc/blob/main/SEO.md) file (_354 lines_) containing all the SEO problems, the severity level and how they can be fixed. 

My site was rated `poor->fair` which is pretty uncool. The site also had __19 SEO issues__ that I needed to work on.

So I got to work (_this time, me, not AI_).   
Why? I haven't written code in a while.

I installed `@astrojs/sitemap`, fixed some bugs in the `base.astro` file and also added some `meta` and `link` tags. I won't bore you with the details.

Would AI have done it well?  Well, yes, it would have.

Yet, we should let those clankers rest (_that's if they can_).

The whole session took around 48mins. Deepseek v4 flash ran for a very long time especially during the SEO audit. The whole session cost me around $0.07 (_its a lot of money, right_ 😁). 

And pi, its really fast and lightweight, its a harness I think I will use for a really long time. 

Besides, I don't like desktop harnesses like Codex and Antigravity. Its not just me.

In conclusion, I think I will delegate more work to AI now, its beginning to disappoint me less.

[^1]: Being logged in to Google can influence search listing; my site will most likely pop up then (_since I do mostly dev things_).

[^2]: [skills.sh](https://skills.sh) is a good repository for finding agent skills for different purposes, from __legal to accounting__. You can install them with the `npx skills add` command.

[^3]: Some skills require that some scripts execute. Therefore, be security conscious when installing some skills and giving agents the permission to use them.

[^4]: The site was written in Astro and AI might have forgotten how to write it.

[^5]: I know, there are some typos. I type faster than my brain sometimes. 
