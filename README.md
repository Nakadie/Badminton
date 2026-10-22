# 🏸 Badminton Court Manager

A React TypeScript application that helps organize badminton players into court assignments using manual or image-based player list extraction.

[**Try the app**](https://sylhare.github.io/Badminton/)

![Badminton Court Manager](public/badminton-court-manager.png)

## Features

- **📸 Image Upload & OCR**: Take a picture of a player list and automatically extract names using Tesseract.js
- **✍️ Manual Player Entry**: Add players manually - one at a time or multiple at once
- **👥 Player Management**: Toggle player presence, remove players
- **🏆 Optimised Court Assignment**: Assigns players to courts with simulated annealing, minimising repeated partnerships over time
  - Doubles (4 players) preferred
  - Singles (2 players) when the players left over don't fill a doubles court
  - Automatic bench assignment for extra players
- **🔄 Team Rotation**: Rotate team compositions on a court without reshuffling everyone
- **📱 Responsive Design**: Works on desktop and mobile devices

## How the app works

A single-page React + TypeScript app with no backend. Everything runs in the browser and state is kept in `localStorage`.

Three screens:

- **`/`** — manage players, generate court assignments, mark winners, and see the leaderboard.
- **`/stats`** — fairness diagnostics for the current session (bench spread, repeated pairings, singles distribution).
- **`/tournament`** — round-robin, elimination and group + knockout tournaments.

What is stored:

- **Players** — name, presence, and (optionally) gender and level.
- **Assignments** — the courts on screen, with teams, winner and set scores.
- **History** — bench counts, singles counts, teammate and opponent pair counts, wins/losses, and level history.

All of it lives under a single key, `badminton-state`, as compressed JSON encoded to base64. Writes go through a queue so concurrent saves never race. A session can be shared as a URL (`?state=…`); opening one offers to replace the current session, with a backup link for what is already stored.

## How the engine works

There are two halves: a **tracker** that remembers what happened, and an **engine** that chooses the next arrangement. They are deliberately separate — the tracker is shared by every engine, and the engines only supply the scoring and the search.

### A round, step by step

`BaseCourtAssignmentEngine.generate()` is a template method; subclasses only implement how players are placed on courts.

1. **Filter to present players.** Capacity is `courts × 4`.
2. **Work out the bench.** `bench = players − capacity`. If the number left on court would be odd, one more player is benched, so no court is ever left with three players.
3. **Pick who sits out.** This step is not optimised: shuffle, then sort by fewest bench counts, pushing anyone benched in the previous round to the back of the queue. Players flagged "Bench next" go first.
4. **Place the rest on courts** with simulated annealing, then split each court of four into teams.
5. **Write history.** +1 bench per benched player, +1 singles per singles player, and +1 for every teammate and opponent pair in the chosen split.
6. **Compare rounds.** The new arrangement is diffed against the previous one to report anomalies: benched twice in a row, singles twice in a row, the same partner twice in a row.

Benching fairness is therefore a greedy sort, while the pairing is the part that is actually searched.

### The cost function

Every candidate arrangement is scored by summing a few counts from history, multiplied by a weight:

| Term | Weight | Why |
|---|---|---|
| Same partners again | 100,000 per previous time | Dominant term: avoids repeating a partner until it is unavoidable |
| Same opponents again | 50 per previous time | Nudges toward new matchups without breaking partnerships |
| Singles again | 100 × both players' singles counts | Spreads singles duty |
| Bench | — | Not part of the cost; handled by the greedy bench pick above |

The partner weight is intentionally enormous. One repeat partnership outweighs almost any amount of opponent repetition, so the engine will rearrange the whole session to give a pair a new partner. Wins and losses do not appear in the default engine's cost at all.

### The annealing loop

The default engine (`SimulatedAnnealingBase` → `engineSA`) uses simulated annealing:

- Start from a **random** arrangement.
- Repeat **500 times**: make a small random change, score it, and keep it if it is better. A worse arrangement is still accepted with probability `e^(−Δ/T)`, which lets the search escape local minima.
- Changes are chosen at random: 50% swap one player between two courts, 30% reshuffle and re-split one court, 20% swap one player between the two teams on a court.
- Temperature `T` starts at 2000 and cools by ×0.985 each iteration, so early moves are adventurous and later ones are conservative.
- The best arrangement seen is returned.

Because the start is shuffled and moves are random, the same players can produce different pairings each round.

### Choosing the teams

For each court of four, the engine tries all three possible 2v2 splits and keeps the cheapest one. With the default engine that means: the split that avoids repeated partnerships, then repeated opponents. Rotation and drag-and-drop let you override it, and the pair counts are corrected to match what you chose.

### The Smart engine

The optional Smart engine (`engineSL2`) adds a level model on top. A player's effective level is `level + (wins − losses) × 3`, clamped to 0–100, and these terms join the cost:

| Term | Weight | Why |
|---|---|---|
| Win balance between teams | 2,000 | Avoids stacking the strongest players together |
| Level gap between teams | 150 | Balanced matches |
| Level spread on a court | 150, beyond a 25-point tolerance | Keeps a court's standard similar |
| Mixed doubles | ±200 | Bonus for two mixed pairs, penalty for all-female vs all-male |
| Same four players again | 800 per repeated pair, once at least 3 pairs on the court have already met | Avoids reusing a pod |
| Same opponents again | 800 (instead of 50) | Stronger matchup variety |

Gender is optional; players without it are ignored by the mixed-doubles term. Levels only move when results are recorded — see below.

### What gets recorded, and when

- **Generate** writes bench, singles and pair counts immediately, and commits the previous round.
- **Marking a winner** writes a win and a loss. With a set score, levels move by an Elo update (K-factor 0.6–3.0, scaled by margin of victory and by how lopsided the teams were).
- **Rotating or dragging players** reverses the old court's pair counts and applies the new ones, so history matches the line-up on screen.
- **Regenerating within two minutes without a result** replaces the previous round instead of adding one: the last round's counts are undone and re-applied to the new arrangement, so re-rolling does not inflate anything.

A round counts as played once the next assignment is generated. It does not require a result, so sessions that never pick a winner still rotate partners and bench fairly.

### Where it lives

| Path | Contents |
|---|---|
| `src/engines/BaseCourtAssignmentEngine.ts` | Template method: bench selection, singles handling, history writes |
| `src/engines/CourtAssignmentTracker.ts` | The memory: counts, snapshots, persistence, round lifecycle |
| `src/engines/SimulatedAnnealingBase.ts` | The annealing loop, moves and shared cost terms |
| `src/engines/SimulatedAnnealingEngine.ts` | Default engine (`sa`) |
| `src/engines/Smart2Engine.ts` | Level-aware engine (`sl`) |
| `src/engines/LevelTracker.ts` | Elo updates and level history |
| `src/engines/engineSelector.ts` | Which engine is active, persisted with the session |
| `src/tournament/` | Round-robin, elimination and group + knockout formats |
| `src/utils/StorageManager.ts` | Compression, single-key persistence, import/export |

See [`analysis/`](analysis/README.md) for simulation scripts and benchmarks.

## Contributing

See [`.github/CONTRIBUTING.md`](.github/CONTRIBUTING.md) for development setup and available scripts.

## License

[AGPL-3.0](LICENSE) © sylhare
