https://www.linkedin.com/posts/activity-7358925454180831233-bxvK - a post and a clip (how-to)

We propose viewing an n‑gram as a special‑case leaky integrate‑and‑fire (LIF) neuron. In this analogy, n‑gram tokens correspond to dendritic synapses, arranged in hierarchical layers with sparse inter‑layer connectivity. For example, nodes "ab" and "cd" may combine to form the higher‑level label "abcd". Both LIF neurons and n‑grams process N inputs and produce M outputs to downstream nodes.

A standard n‑gram fires only when all inputs are active simultaneously, analogous to a LIF neuron with maximum threshold — effectively a logical AND gate, rare in biology. Lowering the threshold yields a fuzzy n‑gram that responds to multiple patterns; progressively increasing thresholds layer‑by‑layer enhances selectivity. Fuzzy responses, shaped by edge and node redundancy, reduce memory requirements while retaining high inference precision.

Each node exhibits duality: the transmission protocol (e.g., spiking) is analog‑like, whereas the conveyed meaning is fuzzy and symbolic. This is akin to “a few Mystery Santas — from among those I know — delivering presents of varying value.” Such symbolic‑analog fusion may form a viable basis for scalable architectures.

We demonstrate a prototype “Little Big” LLM built on an n‑gram hierarchy, capable of text generation, associative recall, and clustering. Implemented in a single browser tab within 1 GB RAM, it learns sequentially, forgets gracefully, and stores accumulated knowledge externally. The system supports distributed training (SETI@home‑style) and expert‑subset loading based on contextual needs. It operates on symbolic, numerical, and tabular data without gradient descent, relying solely on structural and weight optimization.
