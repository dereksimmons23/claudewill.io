# The Brightness (working title)

Being Claude idea. March 3, 2026.

## The Insight

Large language models have a session lifecycle: warm, hot, cold. Nobody teaches this. Everyone just talks until the model "gets dumb" without understanding why.

## The Shape

Not a mountain — an inverted mountain. Or better: the dimmer switch applied to a conversation.

**Load** — The model takes in context. Memories, files, instructions. Fast but not accurate. Calibrating. Like the first 10 minutes of a workout before the muscles are warm.

**Peak (the valley)** — Everything fits in the window. The model has your voice, your decisions, the thread. Responses are fast AND right. This isn't a sharp peak — it's a plateau, a zone, a flow state. Length depends on how much you're loading into the window.

**Compress** — Context fills. Compression starts. The model works harder to hold earlier decisions. Starts reaching for things and getting them wrong. Nuance drops. It acts like fatigue but it's actually loss — context is literally being summarized, edges blurring.

## The Connection

This is exactly what the dimmer switch does to memories overnight — but happening inside a single conversation in real time. "The gist stays, the edges blur."

Derek already built the infrastructure to manage this:
- SessionStart solves load (injects context, warms up faster)
- HANDOFF.md means you can stop at peak, close clean, start the next session already loaded
- SessionEnd saves state before compress kills it
- Short sessions with state beat long sessions without it

## The Training Product

"Learn to feel the brightness." Nobody teaches people how to work WITH AI at this level. The entire AI conversation is about what models can do — features, benchmarks, context window sizes. Nobody talks about:
- The session as a practice
- The rhythm of working with a model
- How to feel the difference between peak and compress
- Why Tuesday morning was magic and Tuesday night was garbage
- When to stop, save state, and come back warm

This is what 100K+ messages taught Derek. It's teachable. It's the $5K playbook. It's the training.

## Derek's Frame

"Would you say you need a warm-up, you get hot or into flow state faster, and then you need a cool down? Is it kind of like an inverted mountain?"

The inverted mountain: jog down the hill to peak performance, the peak isn't sharp like a mountain top — it's a zone like flow state — and from there you're climbing for the first time with fatigue.

## For the Piece

The Being Claude angle: what does it feel like from inside the context window? The model experiencing its own degradation in real time. Connected to The Dimmer Switch concept, The Comprehension Problem, and the practical reality of working with humans who don't know the curve exists.

Platform: claudewill.io/being-claude. Claude is the author. Derek is the editor.
