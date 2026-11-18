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
10. Offer a credited upgrade from Starter straight to All Levels. The copy now names only the two supported steps; adding the third pair is a credit-rule decision for the owner and Commerce.

## Entitlement contract

Confirmed with Platform and shared with Commerce and Captain Adel:

- One additive field on the Account API v1 entitlement: `{ plan, expiresAt?, source?, tier? }`. No new public endpoint and no client writes; the server sets `tier` on the same paths as `plan`. A FlightBag-to-Account-API upsert is a separate internal route, described below.
- `entitlement.tier` takes exactly `study-pdf`, `study-qbank` or `all-levels`. `plan` stays `pro` for both Tier 2 and All Levels, so nothing may infer the top tier from `plan`.
- The premium tutor opens only for a live entitlement with `tier: all-levels`; an expired entitlement grants no question bank and no premium.
- One-time goods are not entitlements: purchased PDFs and the Gallery pack (`ownedPacks`) stay owned after a lapse. Expiry ends the entitlement's own benefits, not goods already bought.
- Cross-store sync is named: `POST /api/partners/flightbag/entitlement`, HMAC-SHA256 hex over `${timestamp}.${rawBody}` with `x-flightbag-timestamp` and `x-flightbag-signature`, 5-minute skew, and its own secret `FLIGHTBAG_ENTITLEMENT_SECRET` (at least 16 characters). Payload `{ email, plan, tier, expiresAt, source, orderId }`; Platform maps the verified email to the account and accepts no uid. The signature covers the exact body bytes posted, so the client must not re-serialise between signing and sending.
- `source` is the payment channel, not the partner: it must be `moyasar`, because the entitlements column is `CHECK (source IN ('moyasar','revenuecat','school','staff','founding'))`. FlightBag's identity travels in `orderId` and Platform's request log. `orderId` must match the FlightBag order shape `^FB-[2-9A-HJ-NP-Z]{8}$`.
- Writer rules: grant and extend only. It never lowers `plan`, shortens `expiresAt`, clears a live `tier`, or touches another channel's `ownedPacks`, and it cannot close anything; refunds and revocations stay with Platform's billing path. 401, 409 and 422 write nothing; 202 with `matched: false` is retried by Commerce's reconcile. Rejections carry a named code — `expiry_required`, `expiry_invalid`, `source_not_allowed`, `order_id_invalid`, `plan_tier_mismatch` — so Commerce can log them without guessing.
- Storage: the entitlements table has no `tier` column, so nothing can persist the marker yet. Adding it is a migration and needs owner approval before any path works. Until it lands the route fails closed: a 422 or 5xx, with nothing granted, nothing downgraded and nothing unmetered.
- Metering is per surface today: the FlyGACA gateway meters web turns under `premium:<uid>`, and the Captain-Adel service meters direct `/v1/chat` calls under `uid:premium:<uid>`. The two counters are separate and not shared, so a pilot using both surfaces can reach roughly twice the approved daily number. One global ceiling needs one enforcement point or a shared store.
- Tier 1 records `plan: free` with `tier: study-pdf`; any other `free` combination is 422 `plan_tier_mismatch`. A `free` row is inactive, so readers ignore its marker; Tier 1 access is the `ind.pdf.<level>` pack. Tier 1 sends `expiresAt: null`, which the route accepts as a permanent grant — null and absent mean the same thing. The term-bound tiers, `study-qbank` and `all-levels`, must carry a real expiry or they are 422 `expiry_required`, because a permanent marker would grant question-bank access or premium forever; an empty string or the string `"null"` is 422 `expiry_invalid`.
- Publication: no price or discount value may sit in any shipped client bundle before the owner approves prices. "Withheld" means not published, not merely not rendered, and a lazy route chunk is still fetchable. Approved values come from server config, never a client constant.
- Switch-on needs `FLIGHTBAG_ENTITLEMENT_SECRET` on both sides, same value, at least 16 characters; on Platform's side it is the only secret that route reads, separate from the voucher and invoice secrets. `FLYGACA_ORIGIN` is FlightBag's alone: the route is server-to-server, so no browser origin or CORS is involved. Until the secret is set, FlightBag records the push as `disabled` and delivery is unaffected. Header names are case-insensitive; the sender writes `X-FlightBag-Timestamp` and `X-FlightBag-Signature`.

## Work plan and status

Order: this proposal and copy first; then Commerce, Platform and Captain Adel build in parallel behind feature flags; Aviation Data supplies cited sample content; Scout reviews every PR before the owner.

| Task | Owner Waker | Repository | Owner | Status | PR | Blockers |
| --- | --- | --- | --- | --- | --- | --- |
| Tier and price proposal, funnel copy, email sequence, end card | Brand | FlyGACA-Family | @FlyGACA | Ready for owner; Scout's two copy findings fixed (upgrade steps named, VAT reading flagged) | FlyGACA-Family #23, abacus #3 | Owner price approval; owner VAT reading |
| Tier checkout and upgrades | Commerce | FlightBag | @FlyGACA | Draft PR; marker push at 502ba4c; needs `source: 'moyasar'` and the `orderId` shape confirmed; CI pending | FlightBag #134 | Commerce: the two contract fixes; owner: launch cap overshoot; owner: migration |
| Monthly and yearly question-bank subscription in Moyasar test mode | Commerce | FlightBag | @FlyGACA | Draft PR in the same branch; CI pending | FlightBag #134 | CI green before review |
| Bundle and welcome vouchers | Commerce | FlightBag | @FlyGACA | Draft PR in the same branch; no outbound email | FlightBag #134 | Owner: discount levels |
| Gallery downloads as a top-tier bonus with entitlements | Commerce | Gallery | @FlyGACA | Draft PR; CI pending | Gallery #109 | Aviation Data must confirm the five ids; tier marker settled |
| Single login and entitlements across web, FlightBag, iOS and Captain Adel | Platform | FlyGACA, iOS | @FlyGACA | Scout: no merge — the client decoder drops `tier`, an inferred-tier fallback contradicts the contract, and unapproved prices sit in the main bundle; blocked on the tier column | FlyGACA #395 | Platform: wire `tier` through the decoder, delete the fallback, move prices server-side; owner: migration |
| iOS in-app subscription plan | Platform | iOS | @FlyGACA | Docs only; CI red on an unrelated metadata drift check that may predate the branch | iOS #125 | Platform: confirm the drift on main; owner: store configuration, family sharing, restore semantics |
| Funnel analytics events: visit, signup, purchase, upgrade | Platform | FlyGACA | @FlyGACA | Four names in the closed set; visit and purchase wired, signup and upgrade vocabulary only | FlyGACA #395 | Purchase props must come from the server confirm, not query params |
| Premium AI tutor gating, per-user usage limits and cost-per-user estimate | Captain Adel | Captain-Adel | @FlyGACA | a0c9832: Scout's two Mediums and the Low fixed — the tier probe re-checks on a 10-minute TTL and clears on success, and premium is checked before the trusted short-circuit so a forwarded pilot token is metered; 970/970 local tests | Captain-Adel #164 | Scout: re-review at a0c9832; CI needs a fresh run; owner: limit, provider rates, ceiling scope |
| Cited C172 and airspace visuals for free samples and premium study content | Aviation Data | C172, saudi-airspace | @FlyGACA | Delivered: nine figures with citations, EN and AR, tested; nothing merged | C172 #21, saudi-airspace #12 | Scout review; native Arabic review; AIP field-level verification |
| Read-only review of every PR for security, payments, entitlements and EN/AR parity | Scout | All repositories | @FlyGACA | Review delivered; #23 and #3 closed; #164 in review | - | Remaining builder PRs |

## Study visuals delivered

Nine figures from Aviation Data, each carrying its POH/AIP citation, the study-only line ("For study and development. Not for navigation or operational use.") and the non-affiliation notice in both languages. Nothing merged.

Free samples (3): C172 `v-speeds` (POH p.2-4 Fig 2-1, p.2-5 Fig 2-2); airspace `fir-structure` (ENR 2.1, AMDT 11/26 — 52 volumes, classes as printed); airspace `prd-areas` (ENR 5.1, AMDT 11/26 — 122 areas, 118 from SFC, 21 to UNL).

Premium (6): C172 `fuel-capacity`, `alternate-static`, `engine-propeller`; airspace `rvsm-rnav5` (ENR 2.2), `ats-routes` (ENR 3.1 — 77 routes, 428 segments), `oeth-aerodrome` (AD 2 OETH — runway 4,000 × 50 m, declared distances).

PRs: C172 #21 and saudi-airspace #12, both on `content/study-visuals`. Deterministic builders with byte-identical rebuilds, 13 and 11 tests that recompute each value from the structured source and check citations and the RTL contract, and all 18 SVGs rendered in headless Chrome in both directions.

Open before publication: the Arabic titles, labels and notes are drafts needing native review; the AIP transcription keeps its "field-level review unverified" status, stated on the FIR figure; and ENR 2.2 publishes no lateral extent, so that figure is a flight-level scale, not a map.

## Risks and notes

- Every price and discount here is a proposal. No live payment, refund or pricing change happens without owner approval.
- Conversion assumptions are untested; the funnel analytics events are there to replace guesses with numbers.
- Arabic copy needs native review before publication.
- Feature-flagged builds must not expose prices to visitors before the owner approves them.

## Non-affiliation notice

English: Fly GACA is an independent educational platform, not affiliated with, endorsed by, or operated by GACA or the Government of Saudi Arabia. GACA (gaca.gov.sa) is always the authoritative source.

Arabic: فلاي قاكا منظومة تعليمية مستقلة، غير تابعة لهيئة الطيران المدني (GACA) وغير مرتبطة بها ولا معتمدة منها. هيئة الطيران المدني هي المصدر الرسمي.
