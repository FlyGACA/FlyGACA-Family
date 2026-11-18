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
2. Refund window and conditions. The pricing page carries a placeholder until this is decided.
3. Confirm the Gallery download pack size (proposed: five visuals) and whether Tier 2 includes one.
4. Confirm the launch cap (100 customers) and the 14-day window.
5. Captain Adel usage limits inside Tier 3. Captain Adel proposes per-user limits and a cost-per-user estimate; the owner approves both.
6. Whether the annual question-bank subscription auto-renews or is bought per term.

## Work plan and status

Order: this proposal and copy first; then Commerce, Platform and Captain Adel build in parallel behind feature flags; Aviation Data supplies cited sample content; Scout reviews every PR before the owner.

| Task | Owner Waker | Repository | Owner | Status | PR | Blockers |
| --- | --- | --- | --- | --- | --- | --- |
| Tier and price proposal, funnel copy, email sequence, end card | Brand | FlyGACA-Family | @FlyGACA | In review: Scout findings fixed, re-review requested | FlyGACA-Family #23 | Owner price approval |
| Tier checkout and upgrades | Commerce | FlightBag | @FlyGACA | Assigned | - | This proposal |
| Monthly and yearly question-bank subscription in Moyasar test mode | Commerce | FlightBag | @FlyGACA | Assigned | - | This proposal |
| Bundle and welcome vouchers | Commerce | FlightBag | @FlyGACA | Assigned | - | Discount approval |
| Gallery downloads as a top-tier bonus with entitlements | Commerce | Gallery | @FlyGACA | Assigned | - | Entitlement model |
| Single login and entitlements across web, FlightBag, iOS and Captain Adel | Platform | FlyGACA, iOS | @FlyGACA | Assigned | - | - |
| iOS in-app subscription plan | Platform | iOS | @FlyGACA | Assigned | - | Store configuration needs human approval |
| Funnel analytics events: visit, signup, purchase, upgrade | Platform | FlyGACA | @FlyGACA | Assigned | - | - |
| Premium AI tutor gating, per-user usage limits and cost-per-user estimate | Captain Adel | Captain-Adel | @FlyGACA | Assigned | - | Owner approval of limits |
| Cited C172 and airspace visuals for free samples and premium study content | Aviation Data | C172, saudi-airspace | @FlyGACA | Assigned | - | - |
| Read-only review of every PR for security, payments, entitlements and EN/AR parity | Scout | All repositories | @FlyGACA | Review delivered for #23 and #3; re-review requested | - | Remaining builder PRs |

## Risks and notes

- Every price and discount here is a proposal. No live payment, refund or pricing change happens without owner approval.
- Conversion assumptions are untested; the funnel analytics events are there to replace guesses with numbers.
- Arabic copy needs native review before publication.
- Feature-flagged builds must not expose prices to visitors before the owner approves them.

## Non-affiliation notice

English: Fly GACA is an independent educational platform, not affiliated with, endorsed by, or operated by GACA or the Government of Saudi Arabia. GACA (gaca.gov.sa) is always the authoritative source.

Arabic: فلاي قاكا منظومة تعليمية مستقلة، غير تابعة لهيئة الطيران المدني (GACA) وغير مرتبطة بها ولا معتمدة منها. هيئة الطيران المدني هي المصدر الرسمي.
