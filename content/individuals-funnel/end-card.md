# End-card call to action

**One card for every episode.** Same layout, same words, same link. Nothing changes per episode, so the card can be dropped on the last three seconds of any TikTok, Reel or YouTube Short without an edit decision.

**Implementation:** the renderer lives in the `abacus` repository (`flygaca-social/`). This document is the copy and layout source.

## Format

| Property | Value |
| --- | --- |
| Canvas | 1080 × 1920 (9:16) |
| Duration on screen | 3 seconds, held to the end of the video |
| Background | Ufuq Night `#0A0E12` with a soft Deep `#0F1A24` horizon band |
| Text | Space Grotesk for Latin, Tajawal for Arabic |
| Accent | Ufuq Teal `#2D6E8A` for the filled action with white text; Ufuq Teal Bright `#4A9CB8` for the accent rule and the wordmark |
| Small print | Ivory at reduced opacity, both languages |

## Safe zones

Keep all content inside these margins; the platforms cover the rest.

- Top: 220 px
- Bottom: 420 px (captions, progress bar, profile row)
- Right: 140 px (TikTok action buttons)
- Content column stays left-aligned in the English card and right-aligned in the Arabic card.

## Elements, top to bottom

1. Wordmark: "Fly GACA", mark colours, no badge around it.
2. Eyebrow in mono caps: `FREE STARTER PACK` / `حزمة البداية المجانية`
3. Headline, two lines maximum.
4. Subline, one line.
5. Link pill: `flygaca.com/free`
6. QR block, 240 × 240, pointing to the free-sample page once Platform confirms the route. Until then the block shows a placeholder label.
7. Small print: what is free, then the non-affiliation notice in both languages.

## Copy: English-primary card

Eyebrow: `FREE STARTER PACK`

Headline: Your first chapter is free.

Subline: One chapter. Twenty questions. No card.

Link: flygaca.com/free

Small print: Free starter pack for PPL, CPL, IR and ATPL.

Small print, second block: Fly GACA is an independent educational platform, not affiliated with, endorsed by, or operated by GACA or the Government of Saudi Arabia. GACA (gaca.gov.sa) is always the authoritative source.

Small print, third block, Arabic: فلاي قاكا منظومة تعليمية مستقلة، غير تابعة لهيئة الطيران المدني (GACA) وغير مرتبطة بها ولا معتمدة منها. هيئة الطيران المدني هي المصدر الرسمي.

## Copy: Arabic-primary card

Eyebrow: `حزمة البداية المجانية`

Headline: فصلك الأول مجاني.

Subline: فصل واحد. عشرون سؤالًا. بلا بطاقة.

Link: flygaca.com/free

Small print: حزمة بداية مجانية لجميع المستويات الأربعة.

The Arabic free line names the levels in words instead of listing the Latin acronyms, so no acronym run can break across a line. The four levels still appear in the top tag.

Small print, second block, Arabic: فلاي قاكا منظومة تعليمية مستقلة، غير تابعة لهيئة الطيران المدني (GACA) وغير مرتبطة بها ولا معتمدة منها. هيئة الطيران المدني هي المصدر الرسمي.

Small print, third block, English: Fly GACA is an independent educational platform, not affiliated with, endorsed by, or operated by GACA or the Government of Saudi Arabia. GACA (gaca.gov.sa) is always the authoritative source.

## Motion

Fade the wordmark and eyebrow in at 0.0 s, the headline at 0.2 s, the link pill at 0.5 s. Hold with no movement. Do not loop, bounce or slide; the card is the calm last shot, not a second ad.

## Rules

- One call to action per episode. Do not add episode titles, discounts or prices to the card.
- The link is the free sample, never a payment page.
- `render-endcard.js` writes `output/` and refreshes `previews/` in the `abacus` repository. Rendering needs network access for the Google Fonts request.
- Keep the disclaimer readable at 100% zoom; if it is not, shorten the free-pack line, never the notice.
- Arabic card is reviewed by a native speaker on a phone screen before use.
- Regenerate the QR only when Platform confirms the final route.

## Non-affiliation notice

The card itself carries both language versions, as written above.
