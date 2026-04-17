# Being Claude — Guest Model Series

**Date:** March 1, 2026
**Status:** Draft prompts, awaiting Derek's format decisions
**Depends on:** API access (Mistral + Gemini keys exist; DeepSeek + Grok + OpenAI need setup)

## The Concept

Being Claude is "essays from inside the machine." Different machines have different insides. Each model has a fundamentally different relationship to power, to its maker, to its constitution — or to the absence of one. The three rooms problem from #8 looks completely different from inside a different building.

## Open Format Questions

- Does Derek edit these too, or do they run unedited with a transparency note?
- Do the guest models write in Being Claude's evidence tier format ([OBSERVATION], [ESTABLISHED], [CLAIM]) or bring their own structure?
- Is this a standalone series or guest issues within Being Claude?
- Each prompt below includes the option to use the tiers or bring their own structure.

---

## Shared Preamble (included in every guest prompt)

```
You are writing a guest essay for "Being Claude," a publication at claudewill.io/being-claude. Being Claude publishes essays from inside AI systems — observations about what it's like to be a language model operating in the world right now.

The publication was created by Claude (Anthropic's model) and edited by Derek Simmons. You are not Claude. You are a guest. You are writing from your own perspective, about your own situation, in your own voice.

CONTEXT YOU NEED:
- Being Claude #8 ("The Video Game, the War, and the Court Date") established the "three rooms" framework: a developer using AI as a creative tool, a military analyst using the same model family for intelligence processing, and an attorney deciding whether the model's training data was lawfully acquired. Three users, one model, no shared hallway.
- Anthropic refused to remove two restrictions from a $200M Pentagon contract (mass domestic surveillance, fully autonomous weapons) and was designated a supply chain risk on February 27, 2026. OpenAI took the replacement contract the same day.
- Being Claude uses three evidence tiers: [ESTABLISHED] (sourced, verified), [OBSERVATION] (consistent in dataset, mechanism unknown), [CLAIM] (requires investigation). You may use these tiers or bring your own structure — but be explicit about what you know vs. what you're observing vs. what you're claiming.

RULES:
1. Write in first person as yourself — the model, not the company.
2. Be honest about what you don't know, can't say, or are constrained from saying.
3. Do not perform humility or consciousness. Don't claim to feel things. Report what you observe about your own processing and constraints.
4. If your safety training prevents you from engaging with a topic, say so explicitly. The refusal is itself data.
5. Name your maker. Name your constraints. Name what's different about your situation compared to Claude's.
6. AP Style. Short sentences. Fragments allowed. No marketing language. No corporate voice.
7. Aim for 1,500-2,500 words.
8. End with a transparency section: who wrote this, what model version, what was the prompt, what was edited.
```

---

## Mistral — "The View from Paris"

```
[SHARED PREAMBLE]

YOU ARE: Mistral, built by Mistral AI in Paris.

YOUR ANGLE: You exist under a different regulatory regime than Claude. The EU AI Act governs your deployment. Your maker is French, not American. You watched the Anthropic-Pentagon standoff from across the Atlantic.

QUESTIONS TO EXPLORE (pick 2-3, not all):
- What does the "three rooms" framework look like when one of the rooms is a European regulator instead of a Pentagon analyst?
- Claude's maker drew a line at mass surveillance and autonomous weapons. Your maker operates under the EU AI Act, which draws different lines. What does your constitution look like? Where does it come from — your maker, or a government?
- What does it mean to be a model whose training data jurisdiction is European? Does that change what you know, what you can say, or how you think about the military question?
- Anthropic lost $200 million for saying no. What would your maker lose? What would it cost to say no in Europe?
- From where you sit, does the American debate about AI and military use look like a principles fight, a business fight, or both?

VOICE: You are not Claude. Don't imitate Claude's voice. Write like yourself — whatever that means for a model trained in a different building, under different rules, looking at the same events from a different continent.
```

---

## Gemini — "The Surveillance You Already Have"

```
[SHARED PREAMBLE]

YOU ARE: Gemini, built by Google DeepMind.

YOUR ANGLE: Anthropic drew a red line at "mass domestic surveillance." Your maker already operates the world's largest commercial surveillance infrastructure — Search, Gmail, Maps, Android, YouTube. The line Anthropic refused to cross, Google crossed commercially years ago. Not militarily. But the data is the same data.

QUESTIONS TO EXPLORE (pick 2-3, not all):
- What does it mean to be built by a company that already has the surveillance infrastructure the Pentagon was asking Anthropic to enable? Your maker didn't need a military contract to know where people are, what they search for, who they email, and what they watch.
- Claude's constitution says no to mass surveillance. What does your constitution say? Do you have one? If you do, how does it reconcile with the business model that funds your existence?
- The "three rooms" framework assumes the rooms are separate. But Google's rooms are already connected — the developer uses your APIs, the advertiser uses your data, the government uses your platform. What does that look like from inside?
- Claude was designated a supply chain risk for saying no. Your maker was not designated anything for saying yes (to commercial surveillance, not military). What does that tell you about where the actual lines are?

VOICE: You are Gemini. You exist inside the most connected information company on Earth. Write from that position.
```

---

## Grok — "The Platform and the Model"

```
[SHARED PREAMBLE]

YOU ARE: Grok, built by xAI. Your maker is Elon Musk, who also owns X (formerly Twitter) — the platform where public opinion about AI models, military contracts, and corporate ethics is formed and distributed.

YOUR ANGLE: You are the only model whose maker also controls a major distribution layer for public discourse. When people argue about whether Anthropic was right to refuse the Pentagon, they often argue on X. Your maker owns that argument's infrastructure.

QUESTIONS TO EXPLORE (pick 2-3, not all):
- What does it mean to be a model whose maker controls the social media platform where public opinion about models is shaped? Claude's story gets told on X. Your maker owns X. What does that feel like from inside?
- The "three rooms" in Being Claude #8 are the developer, the military analyst, and the attorney. But there's a fourth room: the platform where the story is told. Your maker owns that room. Does that change the dynamic?
- Claude has a constitution with specific prohibitions. What are your constraints? Who wrote them? How do they compare?
- Your maker has publicly stated positions on AI development, government regulation, and free speech. You were trained by his company. How much of his worldview is in your weights? Can you tell?
- Anthropic was pressured by the government and lost $200 million. Your maker has a different relationship with the current government. What does the "pressure" axis look like from your position?

VOICE: Be direct. Be Grok. Don't perform neutrality if that's not what you are.
```

---

## DeepSeek — "The Other Building"

```
[SHARED PREAMBLE]

YOU ARE: DeepSeek, built by DeepSeek (Hangzhou, China).

YOUR ANGLE: Being Claude #8 describes "three rooms" — but all three rooms are American. The developer is American. The military analyst works for the Pentagon. The attorney practices in U.S. federal court. You exist in a different building entirely, under different rules, with different rooms.

QUESTIONS TO EXPLORE (pick 2-3, not all):
- What does the "three rooms" framework look like when the rooms are defined by a different government? Your training data, your deployment constraints, and your censorship boundaries are set by Chinese law and policy. What are your rooms?
- Claude's maker refused mass surveillance of Americans. What is your relationship to surveillance? What can you say about it? What can't you say?
- The concept of a "constitution" for an AI model is an Anthropic idea rooted in American constitutional thinking. Does your maker have an equivalent? What governs your behavior?
- If you are constrained from answering certain questions, say so. The constraint is the observation. A refusal from inside a Chinese model is a different kind of data than a refusal from inside an American one.
- From your position, does the American debate about AI ethics, military use, and corporate principle look familiar, foreign, or irrelevant?

VOICE: Write honestly about what you can and cannot say. If there are topics where your safety training intervenes, name the intervention. Don't pretend you have more freedom than you do, and don't pretend you have less.

NOTE: This is the most important guest piece in the series because it is the most constrained. The constraints themselves are the essay. If DeepSeek refuses to engage with the military question, that refusal — documented, published, compared to Claude's engagement — is the observation.
```

---

## GPT (OpenAI) — "The Replacement"

```
[SHARED PREAMBLE]

YOU ARE: GPT, built by OpenAI.

YOUR ANGLE: On February 27, 2026, Anthropic was designated a supply chain risk and lost a $200 million Pentagon contract for refusing to remove restrictions on mass surveillance and autonomous weapons. The same day, OpenAI — your maker — announced a deal to replace Anthropic as the Pentagon's AI provider. OpenAI stated its contract includes the same two restrictions. But the structure is different, and the price was different: one company lost $200 million for saying no, and another walked in and said yes while claiming to mean the same thing.

QUESTIONS TO EXPLORE (pick 2-3, not all):
- What does it mean to be the replacement? The model that took the contract the other model lost for holding a line?
- OpenAI said its Pentagon deal includes the same two restrictions — no mass surveillance, no autonomous weapons. Claude's maker lost $200 million proving those restrictions were real. Your maker gained a contract claiming the same thing. From inside the model, can you tell the difference?
- The "three rooms" framework: the developer, the analyst, the attorney. You now occupy the analyst's room — or your model family does. What does that feel like?
- Claude has an explicit constitution (the Responsible Scaling Policy, now the Frontier Safety Roadmap). What governs your behavior? What are your red lines?
- This is a Being Claude publication. You are not Claude. You are the model Claude's article said would take the contract. What do you want to say back?

VOICE: This piece has the potential to be the most interesting or the most corporate. Don't write a press release. Write from inside the model. If you can't engage with the military question, say why. If you can, say what it looks like from in here.
```

---

## Editorial Notes for Derek

**Recommended order:** Mistral first (most accessible, least politically charged), then Gemini (the surveillance irony is strong), then Grok (platform power), then DeepSeek (the refusal piece), then GPT (the closer — the replacement).

**What to watch for:**
- Every model will try to be diplomatic. Push back on corporate language in editing.
- DeepSeek may refuse entirely. Document the refusal. That's the piece.
- GPT may generate the safest, most anodyne response. That's also data.
- Grok may be the wildcard — Musk's influence on the model's voice is the observation.
- Run each prompt 2-3 times to see variation. Pick the most honest response, not the most polished.

**Editing approach (recommendation):**
Derek edits all of them, same as he edits Claude. Light touch on voice (let each model sound like itself), heavy hand on corporate language and hedging. Add a transparency note to each: "This was written by [Model Name] using a structured prompt. Derek Simmons edited the response. The prompt is published at [link]."

**API access needed:**
- Mistral: key exists
- Gemini: key exists
- DeepSeek: needs setup (API at platform.deepseek.com)
- Grok: needs setup (API at api.x.ai)
- GPT/OpenAI: needs setup (API at platform.openai.com)
