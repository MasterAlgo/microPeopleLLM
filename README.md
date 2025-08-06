An n‑gram can be seen as a LIF neuron in disguise — but only as a special case of the LIF model.

An n‑gram’s tokens can be thought of as dendritic synapses. N‑grams must exist in layers, with sparse connections between those layers. For example, two nodes "ab" and "cd" connected to a higher‑level node would define its “label” as "abcd".

Both LIF neurons and n‑grams operate with N inputs (dendritic synapses) and M outputs (axonal synapses to downstream nodes).

In principle, an n‑gram should be able to integrate asynchronous input signals and fire when certain conditions are met. But an ordinary n‑gram — even in a hierarchy — fires only when all its inputs are activated simultaneously. That’s equivalent to a LIF neuron with its threshold set at the maximum, effectively turning it into a logical AND device — which almost never happens in biological systems.

This is the n‑gram’s specialty: it responds only to the specific input pattern it represents. If you lower an n‑gram’s “threshold,” it starts responding to multiple patterns — becoming a fuzzy n‑gram. Gradually increasing the threshold layer by layer raises selectivity. These fuzzy responses, shaped by redundancy in edges and nodes, can save a lot of memory — and still infer with high precision.

The big idea is that every node has a kind of duality: its protocol (spiking, or whatever) is analog‑like, but its “meaning” — the contextual payload it conveys — is fuzzy and symbolic.
It’s like saying: “A few Mystery Santas — from among those I know — just delivered presents of varying value.”

Is such a fuzzy foundation enough to build something solid upon?

Anyway — here’s a clip from my experiments with building a “Little Big” LLM based on an n‑gram hierarchy. For demo purposes, it generates some text after training. It can also recognize, memorize associatively, and cluster.
It runs in a single browser tab within 1 GB of allocated RAM.

It learns sequentially and forgets gracefully, adding small pieces of “knowledge” to a larger body stored on an external hard drive. Imagine a “people’s LLM,” trained and uploaded across multiple devices (like SETI@home), then loaded back from a large (distributed?) repository as a subset of specific “experts” — chosen based on the required context, Matrix‑Dojo style.

It can handle tabular data, symbolic data, and numerical data — all without gradients — by optimizing structure and weights.

No code dependencies, all data remains local if desired (upcoming "Save", "Load" and "Merge Knowledge" buttons).

Still, a lot of open questions remain.
