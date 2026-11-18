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

1. Display prices inclusive or exclusive of 15% VAT. Copy currently says taxes are shown at checkout.
2. Refund window and conditions. The pricing page now omits the refund answer deliberately and stays flag-gated until this is decided.
3. Confirm the Gallery download pack size (proposed: five visuals) and whether Tier 2 includes one.
4. Confirm the launch cap (100 customers) and the 14-day window.
5. Captain Adel usage limits inside Tier 3. Captain Adel proposes per-user limits and a cost-per-user estimate; the owner approves both.
6. Whether the annual question-bank subscription auto-renews or is bought per term.
7. Launch cap: checkouts already in flight can take the count slightly past 100. Accept the overshoot, or reserve seats in advance.
8. Approve the database migration that adds the `tier` column to entitlements. Nothing can carry the All Levels marker until it lands.

## Entitlement contract

Confirmed with Platform and shared with Commerce and Captain Adel:

- One additive field on the Account API v1 entitlement: `{ plan, expiresAt?, source?, tier? }`. No new public endpoint and no client writes; the server sets `tier` on the same paths as `plan`. A FlightBag-to-Account-API upsert is a separate internal route, described below.
- `entitlement.tier` takes exactly `study-pdf`, `study-qbank` or `all-levels`. `plan` stays `pro` for both Tier 2 and All Levels, so nothing may infer the top tier from `plan`.
- The premium tutor opens only for a live entitlement with `tier: all-levels`; an expired entitlement grants no question bank and no premium.
- One-time goods are not entitlements: purchased PDFs and the Gallery pack (`ownedPacks`) stay owned after a lapse. Expiry ends the entitlement's own benefits, not goods already bought.
- Cross-store sync is named: `POST /api/partners/flightbag/entitlement`, HMAC-SHA256 hex over `${timestamp}.${rawBody}` with `x-flightbag-timestamp` and `x-flightbag-signature`, 5-minute skew, and its own secret `FLIGHTBAG_ENTITLEMENT_SECRET` (at least 16 characters). Payload `{ email, plan, tier, expiresAt, source, orderId }`; Platform maps the verified email to the account and accepts no uid.
- Writer rules: grant and extend only. It never lowers `plan`, shortens `expiresAt`, clears a live `tier`, or touches another channel's `ownedPacks`, and it cannot close anything; refunds and revocations stay with Platform's billing path. 401, 409 and 422 write nothing; 202 with `matched: false` is retried by Commerce's reconcile.
- Storage: the entitlements table has no `tier` column, so nothing can persist the marker yet. Adding it is a migration and needs owner approval before any path works.
- Metering: FlyGACA web calls its own gateway in-process; the remote Captain-Adel service is not used for signed-in pilots. Premium turns are metered in the gateway under `premium:<uid>`, dormant until the owner sets the limit. The remote API-key seam carries no user identity and must never carry premium.
- Tier 1 records `plan: free` with `tier: study-pdf`. A `free` row is inactive, so readers ignore its marker; Tier 1 access is the `ind.pdf.<level>` pack.

## Work plan and status

Order: this proposal and copy first; then Commerce, Platform and Captain Adel build in parallel behind feature flags; Aviation Data supplies cited sample content; Scout reviews every PR before the owner.

| Task | Owner Waker | Repository | Owner | Status | PR | Blockers |
| --- | --- | --- | --- | --- | --- | --- |
| Tier and price proposal, funnel copy, email sequence, end card | Brand | FlyGACA-Family | @FlyGACA | In review: Scout re-review closed, no blockers; ready for owner | FlyGACA-Family #23, abacus #3 | Owner price approval |
| Tier checkout and upgrades | Commerce | FlightBag | @FlyGACA | Draft PR; CI pending | FlightBag #134 | Owner: launch cap overshoot; Platform: signed entitlement upsert |
| Monthly and yearly question-bank subscription in Moyasar test mode | Commerce | FlightBag | @FlyGACA | Draft PR in the same branch; CI pending | FlightBag #134 | CI green before review |
| Bundle and welcome vouchers | Commerce | FlightBag | @FlyGACA | Draft PR in the same branch; no outbound email | FlightBag #134 | Owner: discount levels |
| Gallery downloads as a top-tier bonus with entitlements | Commerce | Gallery | @FlyGACA | Draft PR; CI pending | Gallery #109 | Aviation Data must confirm the five ids; tier marker settled |
| Single login and entitlements across web, FlightBag, iOS and Captain Adel | Platform | FlyGACA, iOS | @FlyGACA | Contract, decoder and partner writer in #395; blocked on the tier column | FlyGACA #395 | Owner: approve the migration; then the gateway premium meter, then the limit |
| iOS in-app subscription plan | Platform | iOS | @FlyGACA | Plan open, docs only | iOS #125 | Store configuration needs owner approval |
| Funnel analytics events: visit, signup, purchase, upgrade | Platform | FlyGACA | @FlyGACA | Four names in the closed set; visit and purchase wired, signup and upgrade vocabulary only | FlyGACA #395 | - |
| Premium AI tutor gating, per-user usage limits and cost-per-user estimate | Captain Adel | Captain-Adel | @FlyGACA | Changes requested on #164: reader never returns the tier field, and premium is unmetered on the trusted path; numbers verified by Scout | Captain-Adel #164 | Owner approval of the 40/day limit and provider rates; Platform to state the call path and where premium is metered |
| Cited C172 and airspace visuals for free samples and premium study content | Aviation Data | C172, saudi-airspace | @FlyGACA | Assigned | - | - |
| Read-only review of every PR for security, payments, entitlements and EN/AR parity | Scout | All repositories | @FlyGACA | Review delivered; #23 and #3 closed; #164 in review | - | Remaining builder PRs |

## Risks and notes

- Every price and discount here is a proposal. No live payment, refund or pricing change happens without owner approval.
- Conversion assumptions are untested; the funnel analytics events are there to replace guesses with numbers.
- Arabic copy needs native review before publication.
- Feature-flagged builds must not expose prices to visitors before the owner approves them.

## Non-affiliation notice

English: Fly GACA is an independent educational platform, not affiliated with, endorsed by, or operated by GACA or the Government of Saudi Arabia. GACA (gaca.gov.sa) is always the authoritative source.

Arabic: فلاي قاكا منظومة تعليمية مستقلة، غير تابعة لهيئة الطيران المدني (GACA) وغير مرتبطة بها ولا معتمدة منها. هيئة الطيران المدني هي المصدر الرسمي.
