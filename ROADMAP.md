# Roadmap

This is a fork of [sylhare/Badminton](https://github.com/sylhare/Badminton). It exists to serve a Japanese-speaking casual group and to run as a local app on a phone. Upstream stays the reference; changes here should be easy to review against it.

## Where things stand

| Item | State | Where |
| --- | --- | --- |
| Japanese UI, language picker in the footer | Open PR | `feat/japanese-localization` (PR #1) |
| Docker Compose for local runs | Part of PR #1 | same branch |
| Rounds count without a recorded winner | Open PR, stacked on #1 | `fix/count-rounds-without-winner` (PR #2) |
| README: app + engine documentation | Merged to `main` | `README.md` |

Nothing below starts until #1 and #2 land, because both touch the same files.

## Design decisions already taken

These came out of the casual-mode and session discussions and constrain the work:

- **A round is a played arrangement, not a decided result.** Bench, singles and partner history advance on generate; results are optional.
- **Casual mode records nothing.** No winners, no scores, no levels, no leaderboard, no tournament. Court layout, team splits, rotation and rearrange stay exactly as they are.
- **Partner variety is what matters**, not opponent variety. The engine already weights a repeated partner at 100,000 and an opponent at 50, so casual needs no engine change.
- **A session archives wins and losses only.** Bench counts, singles counts, partner history and rounds are session-local and restart.
- **Skill persists across sessions.** Levels and gender stay with the player; a roster stays the same within and between sessions.
- **The app ships as a local APK.** No hosting, no store requirement, and photo import is dropped.

## Phase 1 — make the app fit the group

| # | Feature | What it does | Why now | Trigger |
| --- | --- | --- | --- | --- |
| P1 | **Casual / Competitive mode** | Casual stops recording results and hides the leaderboard, winner tap and level chart. Teams, splits, rotation and bench are untouched. Competitive is today's app. | The group decides pairings themselves and does not want a win/loss record | First casual session |
| P2 | **New Session + history** | Archives the session's wins/losses (date, per player), then clears wins, losses, bench, singles, pairs and rounds. Players, presence, levels and settings stay. Stats page lists past sessions and all-time totals. | "Reset" currently destroys the record; groups want a fresh slate without losing history | Second session with the same group |

Both are independent and can land in either order. P1 is roughly half a day; P2 is roughly three days, mostly storage format and the stats-page section.

Open details for P2: the archive cap (20 sessions, older dropped), retiring "Reset Algorithm" in favour of "New Session", and whether imported/shared sessions replace local history (today they do, because import rewrites the whole stored blob).

## Phase 2 — a real app on the phone

| # | Feature | What it does | Trigger |
| --- | --- | --- | --- |
| A1 | **Capacitor Android build** | Bundles the built app into an APK served from an internal origin. Works offline, no server, No Play Store needed; sideload the APK. | P1 and P2 are stable |
| A2 | **Remove the photo pipeline** | Drops `ImageUploadModal`, `useImageOcr`, the OCR/OpenCV utils, the Tesseract asset plugin and the camera button. Removes ~35 MB of assets and the only WASM/SharedArrayBuffer dependency. | Doing A1 |
| A3 | **Mobile polish** | Durable storage instead of `localStorage`, Android back button closes modals, safe-area insets, `100dvh` instead of `100vh`, icons and splash. | Doing A1 |
| A4 | **Hide the share link in the app** | Share URLs point at an internal origin, so they are meaningless to another phone. | Doing A1 |

Target is a signed release APK installed via `adb` or copied to the phone. Play Store publication is out of scope until asked for.

## Phase 3 — later

| # | Feature | Trigger |
| --- | --- | --- |
| L1 | **Club rosters, hot-swappable** | More than one regular group shares the app. A session gains a roster; swapping rosters swaps the player list without losing history |
| L2 | **Japanese photo import** | Someone insists on photographing a name list. Needs `jpn` traineddata plus different name heuristics, or a native ML Kit path |
| L3 | **Installable web app (PWA)** | The group wants it on a phone without an APK, and is willing to host it. Capacitor covers the offline case already |
| L4 | **Tournament UX for casual groups** | Someone actually uses tournament mode more than once |

## Not planned

- Rewriting as React Native, Flutter or Kotlin. The engine is roughly a third of the code and is already tested; a native UI means maintaining two front-ends.
- Hosted multi-tenant deployment. The app has no backend and no accounts.
- Changing the upstream default behaviour of the main screen.

## Open questions

1. **Send fixes upstream?** PR #2 (rounds without a winner) is a genuine bug fix and could go to sylhare/Badminton. The i18n layer and casual mode are our product direction.
2. **Default mode for a new session.** Competitive preserves current behaviour; casual matches this group.
3. **Play Store or sideload only.** Sideload is enough for one group; the store adds a privacy policy, data-safety form and signing pipeline.
4. **What belongs in a session share.** Today a shared link carries the whole session; it does not need to carry history.
