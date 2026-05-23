# Architecture

Bastion is a swarm of specialised agents wrapped in a policy-gated control
loop. One pass over a market frame is:

```
oracle quote ─▶ regime detector ─▶ council debate ─▶ risk kernel ─▶ proof ─▶ execute
                     │                   │                │            │
                  bandit            5 agents         Kelly/CVaR    keccak256
                 (strategy)        quorum vote      circuit-break   + anchor
```

## Layers

| Layer | Module | Responsibility |
|-------|--------|----------------|
| Regime | `regime/detector.ts` | classify trend / chop / high-vol |
| Allocation | `regime/bandit.ts` | Thompson sampling across strategies |
| Council | `swarm/council.ts` | independent opinions → quorum vote |
| Agents | `swarm/agents/*` | Analyst · Sentiment · Risk · Contrarian · Executor |
| Risk | `risk/*` | Kelly sizing, CVaR cap, drawdown breaker |
| Memory | `memory/reflexive.ts` | recall similar past states, post-mortems |
| Proof | `proof/*` | hash the decision, anchor on Robinhood Chain |
| Chain | `chain/*` | oracle reads + execution adapter |

No single agent can move capital. A quorum moves it, or the desk stays flat.
