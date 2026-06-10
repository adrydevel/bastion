# Verifiable reasoning

Every decision — the agent votes, the feature window, the final verdict — is
serialised and hashed with `keccak256`. The pair of hashes plus a timestamp is
the *proof*. Anchoring the proof on Robinhood Chain makes each trade auditable
and tamper-evident after the fact: anyone can recompute the hash from the
published decision and confirm the desk acted as it claimed.

In the hosted runtime the reasoning executes inside a TEE and the enclave signs
the attestation, so the proof also certifies *where* the decision ran — not just
that it is internally consistent.

> Auditable beats autonomous. An agent that cannot show its evidence trail is a
> demo, not infrastructure.
