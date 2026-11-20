# Pricing page copy

**Route:** `/pricing` (Platform to confirm). Same page serves English and Arabic; the language switch must keep the chosen tier visible.
**Status:** draft. Prices match the tier proposal and are not live until the owner approves.

## Hero

Eyebrow: `INDIVIDUALS`

H1: Study with a plan, not a pile of files.

Subhead: Bilingual study material for Saudi student pilots and pilots, from PPL to ATPL. Start with a free chapter and twenty questions, then choose the tier that matches your next exam.

Primary action: **Start with the free sample**
Secondary action: **Compare tiers**

Trust line: PPL · CPL · IR · ATPL — Online question bank — English and Arabic — One account across web, FlightBag and iOS.

## Non-affiliation notice

Place this directly under the hero, above any tier card or GACAR mention, and repeat it in the footer.

English: Fly GACA is an independent educational platform, not affiliated with, endorsed by, or operated by GACA or the Government of Saudi Arabia. GACA (gaca.gov.sa) is always the authoritative source.

Arabic: فلاي قاكا منظومة تعليمية مستقلة، غير تابعة لهيئة الطيران المدني (GACA) وغير مرتبطة بها ولا معتمدة منها. هيئة الطيران المدني هي المصدر الرسمي.

## Tier cards

### Study PDF — 149 SAR

For the pilot who already has a study routine.

- One level: PPL, CPL, IR or ATPL
- Full PDF study guide
- Free updates within the current edition

Action: **Choose PDF**

### Study + Question Bank — from 299 SAR

Recommended. The tier that pairs the guide with daily practice.

- Everything in Study PDF
- Online question bank with spaced repetition: 6 months for 299 SAR, or 12 months for 449 SAR
- Progress tracking and a daily review queue

Action: **Choose question bank**

### All Levels — 1,499 SAR

One purchase, PPL to ATPL.

- All four PDFs: PPL, CPL, IR, ATPL
- Question bank for 12 months
- Gallery download pack: five visuals
- Captain Adel premium: AI tutor with usage limits
- One account across web, FlightBag and iOS

Action: **Choose All Levels**

Small print under the tier: Captain Adel usage limits apply. Prices are in SAR; taxes are shown at checkout.

## Add-on: already own a PDF?

Add the question bank on its own: **49 SAR per month** or **399 SAR per year**.

Action: **Add the question bank**

## Compare tiers

| Included | Study PDF | Study + Question Bank | All Levels |
| --- | --- | --- | --- |
| PDF study guide | One level | One level | All four levels |
| Online question bank | Not included | 6 or 12 months | 12 months |
| All levels PPL, CPL, IR, ATPL | Not included | Not included | Yes |
| Gallery download pack | Not included | Not included | Five visuals |
| Captain Adel premium | Not included | Not included | Yes, with usage limits |
| English and Arabic | Yes | Yes | Yes |
| Updates within the current edition | Yes | Yes | Yes |

## FAQ

**What is the question bank?**
A set of online practice questions organised by level, with spaced repetition: questions you miss come back sooner, questions you know come back later. It runs in the browser and in the iOS app.

**Which levels does it cover?**
PPL, CPL, IR and ATPL. Tier 1 and Tier 2 cover one level of your choice; All Levels covers all four.

**Is the material based on GACAR?**
It is built for GACAR theory study, and each study unit lists the GACAR material it draws on. GACA (gaca.gov.sa) is always the authoritative source, so verify current publications before relying on any aviation information. The citation mapping is an Aviation Data deliverable and a condition of publishing this page.

**How long do I keep access?**
PDFs are yours to keep. The question bank runs for the term you choose, and you can renew or upgrade at any time.

**Can I upgrade later?**
Yes. Upgrades move one tier at a time: Study PDF to Study + Question Bank, or Study + Question Bank to All Levels. You pay the difference, and what you paid for the earlier tier is credited at checkout, within 90 days for the step up to All Levels. Going from Study PDF straight to All Levels is not a credited upgrade. Vouchers apply to a first purchase only and do not combine with upgrade credit.

**How is VAT handled?**
Prices are in SAR. Taxes are shown at checkout.

> Owner decision, open: the client price field is documented as VAT-inclusive. Choose one reading and the copy follows. If inclusive (recommended: ZATCA consumer display expects it), both this answer and the small print read "Prices are in SAR and include 15% VAT." / "الأسعار بالريال السعودي وتشمل ضريبة القيمة المضافة 15%." If exclusive, the current line stands and the client comment must change. Do not publish the page with the two readings unreconciled.

**What do I need to start?**
One FlyGACA account. It works across the website, FlightBag and the iOS app, and it keeps your entitlements in one place.

## Closing band

Not sure yet? Read the free chapter and try twenty questions first.

Action: **Get the free chapter**
Line under the action: No card needed.

## Footer notice

Repeat the notice above in the footer on every breakpoint.

## Implementation notes for Platform

- Prices, tier names and voucher codes must come from one configuration source, not from page copy, so a price change never needs a code edit in two places.
- Keep the notice directly under the hero and again in the footer, before any tier card or GACAR mention.
- Layout follows [design-notes.md](design-notes.md): logical properties, mirrored layout in Arabic, no letter-spacing in Arabic, codes such as GACAR set left to right inside Arabic text.
- Do not ship placeholder text. The refund answer is deliberately absent until the owner decides; add it as approved copy, never as a bracketed TODO.
- Citation mapping for the GACAR FAQ answer is an Aviation Data deliverable; do not publish that answer ahead of it.
