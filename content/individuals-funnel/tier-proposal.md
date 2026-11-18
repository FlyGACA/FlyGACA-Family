# Tier and price proposal

**Status:** draft v1 for owner approval. Nothing here is live; payments stay in Moyasar test mode.
**Author:** Brand. **Approvers:** owner (prices, discounts, usage limits).


## Goal

Turn individual Saudi student pilots and pilots into paying, renewing customers: a low first purchase, a renewing question bank, and a top tier that bundles everything. The funnel is a short video, a free sample, an email signup, then the offer below.

## Tiers

All prices in Saudi riyals (SAR). One-time unless marked as a subscription.

| # | Tier | Included | Price | Role in the ladder |
| --- | --- | --- | --- | --- |
| 1 | Study PDF | One level: PPL, CPL, IR or ATPL. Full PDF study guide. Free updates within the current edition. | 149 | Low-risk first purchase |
| 2 | Study + Question Bank | Tier 1 plus the online SRS question bank, 6 or 12 months | 299 (6 months) / 449 (12 months) | The main seller and the renewing engine |
| 3 | All Levels | All four PDFs (PPL, CPL, IR, ATPL), question bank for 12 months, Gallery download pack (five visuals), Captain Adel premium with usage limits | 1,499 | Anchor tier for serious candidates |

### Standalone subscription

For learners who already own a PDF: the question bank alone at **49 SAR per month** or **399 SAR per year**. Sold inside FlightBag; managed in Moyasar test mode until the owner approves live billing.

## Launch offer

First 100 customers, 14 days from launch:

| Tier | Launch price | Regular price |
| --- | --- | --- |
| Study PDF | 99 | 149 |
| Study + Question Bank, 6 months | 249 | 299 |
| Study + Question Bank, 12 months | 349 | 449 |
| All Levels | 1,199 | 1,499 |

Launch pricing does not stack with the welcome voucher.

**Enforcement:** the window is one server-side promo config with a start and end timestamp plus a redemption counter. Whichever limit is reached first closes the offer, and the counter is shared across web, FlightBag and iOS. A closed promo does not reopen by editing copy.

## Welcome voucher

**WELCOME15:** 15% off the first purchase, one use per customer, valid 14 days from signup. Issued by the last email of the welcome sequence. It applies to a first purchase only; an upgrade order is not a first purchase and cannot carry a voucher.

## Upgrades

- Tier 1 to Tier 2: pay the difference for the chosen question-bank term; the PDF price is credited in full.
- Tier 2 to Tier 3: credit the amount paid for Tier 2 within 90 days of purchase.
- All credit is calculated server-side at checkout. No manual codes, no refunds disguised as credit.
- Precedence: vouchers apply to list price on a first purchase only. An order that uses upgrade credit cannot carry a voucher, and launch pricing never combines with WELCOME15. Commerce implements exactly this order: credit first, then no voucher.

## Why these numbers

- 149 SAR keeps the first decision small while still qualifying the buyer.
- The 6-to-12 month gap (299 to 449) pushes annual commitments without a hard wall.
- 1,499 SAR carries the costliest components (AI tutor, Gallery pack) and makes Tier 2 look moderate.
- 49 SAR per month converts to 399 SAR per year, a visible saving that renews.

## Open decisions for the owner

1. Display prices inclusive or exclusive of 15% VAT. The copy says taxes are shown at checkout; the client price field is documented as VAT-inclusive. Pick one and the copy follows — inclusive is the recommended reading for ZATCA consumer display, and ready EN/AR lines are in `pricing-page.md`.
2. Refund window and conditions. The pricing page now omits the refund answer deliberately and stays flag-gated until this is decided.
3. Confirm the Gallery download pack size (proposed: five visuals) and whether Tier 2 includes one.
4. Confirm the launch cap (100 customers) and the 14-day window.
5. Captain Adel usage limits inside Tier 3. Captain Adel proposes per-user limits and a cost-per-user estimate; the owner approves both.
6. Whether the annual question-bank subscription auto-renews or is bought per term.
7. Launch cap: checkouts already in flight can take the count slightly past 100. Accept the overshoot, or reserve seats in advance.
8. Approve the database migration that adds the `tier` column to entitlements. Nothing can carry the All Levels marker until it lands. No restart is needed afterwards: the tutor's reader re-checks the column every ten minutes and opens on its own.
9. Set the premium ceiling per surface or globally. Today the gateway and Captain Adel meter separately, so a pilot on both could reach about twice the approved daily number; a global ceiling needs one enforcement point.
10. Offer a credited upgrade from Study PDF straight to All Levels. The copy now names only the two supported steps; adding the third pair is a credit-rule decision for the owner and Commerce.

## Entitlement contract

Confirmed with Platform and shared with Commerce and Captain Adel:

- One additive field on the Account API v1 entitlement: `{ plan, expiresAt?, source?, tier? }`. No new public endpoint and no client writes; the server sets `tier` on the same paths as `plan`. A FlightBag-to-Account-API upsert is a separate internal route, described below.
- `entitlement.tier` takes exactly `study-pdf`, `study-qbank` or `all-levels`. `plan` stays `pro` for both Tier 2 and All Levels, so nothing may infer the top tier from `plan`.
- The premium tutor opens only for a live entitlement with `tier: all-levels`; an expired entitlement closes the premium. The question bank is the exception: it follows its own `packExpiries` instant, never the grant's `expiresAt`, so a standalone bank renewal the pilot paid for keeps running after the tier that carried it lapses. `questionBankActive` is `packExpiries` later than now, with no dependence on `expired`; both decoders and the tests say the same.
- One-time goods are not entitlements: purchased PDFs and the Gallery pack (`ownedPacks`) stay owned after a lapse. Expiry ends the entitlement's own benefits, not goods already bought.
- Cross-store sync is named: `POST /api/partners/flightbag/entitlement`, HMAC-SHA256 hex over `${timestamp}.${rawBody}` with `x-flightbag-timestamp` and `x-flightbag-signature`, 5-minute skew, and its own secret `FLIGHTBAG_ENTITLEMENT_SECRET` (at least 16 characters). Payload `{ email, plan, tier, expiresAt, source, orderId }`; Platform maps the verified email to the account and accepts no uid. The signature covers the exact body bytes posted, so the client must not re-serialise between signing and sending.
- `source` is the payment channel, not the partner: it must be `moyasar`, because the entitlements column is `CHECK (source IN ('moyasar','revenuecat','school','staff','founding'))`. FlightBag's identity travels in `orderId` and Platform's request log. `orderId` must match the FlightBag order shape `^FB-[2-9A-HJ-NP-Z]{8}$`.
- Writer rules: grant and extend only. It never lowers `plan`, shortens `expiresAt`, clears a live `tier`, or touches another channel's `ownedPacks`, and it cannot close anything; refunds and revocations stay with Platform's billing path. 401, 409 and 422 write nothing; 202 with `matched: false` is retried by Commerce's reconcile. Rejections carry one of six named codes — `expiry_required`, `expiry_invalid`, `source_not_allowed`, `order_id_invalid`, `plan_tier_mismatch`, `tier_unknown` — so Commerce can log them without guessing and enumerate the set.
- Storage: the entitlements table has no `tier` column, so nothing can persist the marker yet. Adding it is a migration and needs owner approval, and it lands together with the server projection in `getEntitlement`/`setEntitlement`/`/api/account` plus the partner route, because none of the three is useful alone. Until then the route is not deployed and the path answers 404; if a deployment exists while the column is missing (a failed or rolled-back migration), it answers 503 with the code `tier_column_missing`. Checks run in order — signature (401), then capability (503), then body validation (422) — so an unmigrated deployment never answers 422 for a payload it cannot store. Both 404 and 503 are retriable and neither is a 422, so Commerce must never record them as a permanent rejection. Nothing is granted, downgraded or left unmetered.
- Metering is per surface today: the FlyGACA gateway meters web turns under `premium:<uid>`, and the Captain-Adel service meters direct `/v1/chat` calls under `uid:premium:<uid>`. The two counters are separate and not shared, so a pilot using both surfaces can reach roughly twice the approved daily number. One global ceiling needs one enforcement point or a shared store.
- Tier 1 records `plan: free` with `tier: study-pdf`; any other `free` combination is 422 `plan_tier_mismatch`. A `free` row is inactive, so readers ignore its marker; Tier 1 access is the `ind.pdf.<level>` pack. Tier 1 sends `expiresAt: null`, which the route accepts as a permanent grant — null and absent mean the same thing. The term-bound tiers, `study-qbank` and `all-levels`, must carry a real expiry or they are 422 `expiry_required`, because a permanent marker would grant question-bank access or premium forever; an empty string or the string `"null"` is 422 `expiry_invalid`.
- Publication: no price or discount value may sit in any shipped client bundle before the owner approves prices. "Withheld" means not published, not merely not rendered, and a lazy route chunk is still fetchable. Approved values come from server config, never a client constant.
- Switch-on needs `FLIGHTBAG_ENTITLEMENT_SECRET` on both sides, same value, at least 16 characters; on Platform's side it is the only secret that route reads, separate from the voucher and invoice secrets. `FLYGACA_ORIGIN` is FlightBag's alone: the route is server-to-server, so no browser origin or CORS is involved. Until the secret is set, FlightBag records the push as `disabled` and delivery is unaffected. Header names are case-insensitive; the sender writes `X-FlightBag-Timestamp` and `X-FlightBag-Signature`.

## Work plan and status

Order: this proposal and copy first; then Commerce, Platform and Captain Adel build in parallel behind feature flags; Aviation Data supplies cited sample content; Scout reviews every PR before the owner.

| Task | Owner Waker | Repository | Owner | Status | PR | Blockers |
| --- | --- | --- | --- | --- | --- | --- |
| Tier and price proposal, funnel copy, email sequence, end card | Brand | FlyGACA-Family | @FlyGACA | Ready for owner; Scout's two copy findings fixed (upgrade steps named, VAT reading flagged) | FlyGACA-Family #23, abacus #3 | Owner price approval; owner VAT reading |
| Tier checkout and upgrades | Commerce | FlightBag | @FlyGACA | 9505a13: `source: 'moyasar'`, order ids match the shape, and 404 / 503 / any unnamed status record `retry` while only 401, 409 and the six 422 codes record `failed`; CI pending | FlightBag #134 | CI; owner: launch cap overshoot; owner: migration |
| Monthly and yearly question-bank subscription in Moyasar test mode | Commerce | FlightBag | @FlyGACA | Draft PR in the same branch; CI pending | FlightBag #134 | CI green before review |
| Bundle and welcome vouchers | Commerce | FlightBag | @FlyGACA | Draft PR in the same branch; no outbound email | FlightBag #134 | Owner: discount levels |
| Gallery downloads as a top-tier bonus with entitlements | Commerce | Gallery | @FlyGACA | Draft PR; CI pending | Gallery #109 | Aviation Data must confirm the five ids; tier marker settled |
| Single login and entitlements across web, FlightBag, iOS and Captain Adel | Platform | FlyGACA, iOS | @FlyGACA | Review-closed by Scout at 22942f6: the decoder carries a valid `tier` marker, prices are server-side and withheld until approved, the pack-derived tier and the loose analytics props are gone, and the route's check order and 503/404 semantics are pinned in docs. Scout's one Medium — a contract self-contradiction over whether the question bank dies with the grant — is fixed: the bank follows its own `packExpiries` instant in both decoders and in the tests, so a renewal the pilot paid for survives a lapsed tier. 0 check runs, because no pull-request workflow has fired in this repository since 2026-11-04 | FlyGACA #395 | Repo admin: restore PR workflow runs; Platform: local suite output in the PR body; owner: migration with the server projection and the route, whose builder must ship the 401/503/422 ordering test |
| iOS in-app subscription plan | Platform | iOS | @FlyGACA | cfd52a6: family sharing recorded as an owner decision, restore path corrected, product-to-entitlement table added; red on metadata drift that predates the branch | iOS #125 | Owner: store configuration and family sharing; the drift is on main at 1be1d3c |
| Funnel analytics events: visit, signup, purchase, upgrade | Platform | FlyGACA | @FlyGACA | Four names in the closed set; visit and purchase wired, signup and upgrade vocabulary only | FlyGACA #395 | Purchase props must come from the server confirm, not query params |
| Premium AI tutor gating, per-user usage limits and cost-per-user estimate | Captain Adel | Captain-Adel | @FlyGACA | a0c9832: Scout closed all three and CI is green (build and landing success, live-eval skipped); the tier probe re-checks on a 10-minute TTL and premium sits above the trusted short-circuit; residual nit — inside the probe window a tier-less row can still look like a successful write | Captain-Adel #164 | Owner: limit, provider rates, ceiling scope |
| Cited C172 and airspace visuals for free samples and premium study content | Aviation Data | C172, saudi-airspace | @FlyGACA | Scout verified every drawn value against the POH table and the printed AIP sections. All three of Scout's merge items are fixed: saudi-airspace lint green at 2868a04, disclosure band above the plot on all nine figures in both languages, and per-figure citations pinned by tests (airspace) and re-checked against the POH at build time (C172). C172 #21 at e59c670 still has its `verify` check in progress | C172 #21, saudi-airspace #12 | Scout re-review of e59c670 and 2868a04; C172 `verify` check; native Arabic review; AIP field-level verification |
| Read-only review of every PR for security, payments, entitlements and EN/AR parity | Scout | All repositories | @FlyGACA | Review closed: #23 delta at c40e454, abacus #3, #164 at a0c9832; C172 #21 and saudi-airspace #12 reviewed with blockers; #395 review-closed at 22942f6 and #125 at cfd52a6 | - | Builder PRs still awaiting CI |

## Study visuals delivered

Nine figures from Aviation Data, each carrying its POH/AIP citation, the study-only line ("For study and development. Not for navigation or operational use.") and the non-affiliation notice in both languages. Nothing merged.

Free samples (3): C172 `v-speeds` (POH p.2-4 Fig 2-1, p.2-5 Fig 2-2); airspace `fir-structure` (ENR 2.1, AMDT 11/26 — 52 volumes, classes as printed); airspace `prd-areas` (ENR 5.1, AMDT 11/26 — 122 areas, 118 from SFC, 21 to UNL).

Premium (6): C172 `fuel-capacity`, `alternate-static`, `engine-propeller`; airspace `rvsm-rnav5` (ENR 2.2), `ats-routes` (ENR 3.1 — 77 routes, 428 segments), `oeth-aerodrome` (AD 2 OETH — runway 4,000 × 50 m, declared distances).

PRs: C172 #21 (head e59c670) and saudi-airspace #12 (head 2868a04), both on `content/study-visuals`. Deterministic builders with byte-identical rebuilds, and all 18 SVGs rendered in headless Chrome in both directions. Citations are now bound, not just listed: each airspace figure is pinned to its own section and amendment in the tests (ENR 2.1, 5.1, 2.2, 3.1 at AMDT 11/26; AD 2 OETH at AMDT 10/26), and every C172 value is re-checked against the POH table at build time, so a drifted VNE, airspeed arc or usable fuel stops the build. Each figure now opens with the study-only line and the non-affiliation notice in a band above the title and plot, in both languages, with a test that the band precedes the first drawing group; the footer keeps the full GACA verification sentence. Both repos still finish with the Arabic titles, labels and notes as drafts for native review.

Open before publication: the Arabic titles, labels and notes are drafts needing native review; the AIP transcription keeps its "field-level review unverified" status, stated on the FIR figure; and ENR 2.2 publishes no lateral extent, so that figure is a flight-level scale, not a map.

Open before merge: nothing from Scout's earlier read — lint is green at saudi-airspace 2868a04 (F841 and the B007 loop variables fixed, `make rebuild-check` inside the same job) and the disclosure band now sits above the first drawing group on all nine figures. C172 #21 at e59c670 still shows its `verify` check in progress; that is the one gate not yet reported. Scout's re-review of the two heads is the next step.

## Risks and notes

- Every price and discount here is a proposal. No live payment, refund or pricing change happens without owner approval.
- Conversion assumptions are untested; the funnel analytics events are there to replace guesses with numbers.
- Arabic copy needs native review before publication.
- Feature-flagged builds must not expose prices to visitors before the owner approves them.
- CI: no pull-request workflow has run in the FlyGACA repository since 2026-11-04, and every open PR there shows 0 checks. Actions are enabled, so this needs a repository admin to look before any of those PRs can be gated.

## Non-affiliation notice

English: Fly GACA is an independent educational platform, not affiliated with, endorsed by, or operated by GACA or the Government of Saudi Arabia. GACA (gaca.gov.sa) is always the authoritative source.

Arabic: فلاي قاكا منظومة تعليمية مستقلة، غير تابعة لهيئة الطيران المدني (GACA) وغير مرتبطة بها ولا معتمدة منها. هيئة الطيران المدني هي المصدر الرسمي.
