# Design notes for the funnel surfaces

These notes keep the pricing page, free-sample page and end card on the UFUQ identity. Values come from the UFUQ token set; components read roles, not raw palette values.

## Token mapping

| Element | Token | Note |
| --- | --- | --- |
| Page canvas | `--ufuq-bg` | Night is the default; the day theme is a reading choice, never automatic |
| Section band | `--ufuq-bg-alt` | Alternate bands separate the tiers from the FAQ |
| Tier card | `--ufuq-surface` | Card ground |
| Card hairline | `--ufuq-border` | Borders stay quiet |
| Recommended tier outline | `--ufuq-border-strong` | Pair with the word "Recommended", never colour alone |
| Primary action | `--ufuq-brand` fill, `--ufuq-on-brand` text | Teal is the only filled action colour |
| Secondary action and links | `--ufuq-link` | Teal Bright on dark |
| Body text | `--ufuq-text` | Primary copy |
| Supporting text | `--ufuq-text-muted` | Tier descriptions and small print |
| Eyebrow | `--ufuq-heritage` | Uppercase mono, short, used sparingly |
| Captain Adel row | `--ufuq-adel` | Sage belongs to Captain Adel only, never decoration |
| Price display | `--ufuq-font-display`, `--ufuq-fs-h2` | Tabular figures in mono for the comparison table |
| Labels and codes | `--ufuq-font-mono` | Wrap GACAR, PPL, CPL, IR and ATPL in `.ufuq-latin` inside Arabic text |
| Focus | `--ufuq-focus` | Visible ring on every interactive element |
| Spacing | `--ufuq-space-4`, `-6`, `-8` | Consistent card padding and section rhythm |

## Layout

- Three tier cards in one row on desktop, stacked on mobile; the recommended tier sits second and carries the label.
- The comparison table scrolls horizontally on narrow screens with the first column sticky.
- The closing band repeats the free-sample action; it is the last thing before the footer.
- Keep the disclaimer above the first regulatory mention and in the footer on every page.

## Right-to-left

- Use logical properties (`margin-inline`, `padding-inline`, `inset-inline-start`) so the layout mirrors without overrides.
- Arabic never gets letter-spacing; the token layer already zeroes tracking under `:lang(ar)`.
- Codes and level names stay left to right inside Arabic text with `.ufuq-latin`.
- Mirror the card order visually, not the reading order of the comparison table headers.
- Numerals: this package uses Arabic-Indic numerals in Arabic prose while the pricing page matches checkout totals. Pick one system site-wide, recommend Western digits on the page to match the payment sheet, and apply it in one place.

## Accessibility

- Body text meets 4.5:1 on Night; Teal is not used for text on dark, Teal Bright is.
- State is never carried by colour alone: write "Recommended", "Included" or "Not included" in the table.
- Every interactive element has a visible focus ring.
- Form fields have persistent labels, an inline error message and an explicit consent checkbox.
- Respect reduced motion; the end card holds still.
- The end-card QR has a text link beside it, so the card works without scanning.

## Brand rules

- The Fly GACA mark leads; no sub-brand mark at the same size. Sub-brand names: FlightBag (حقيبة الطيار), Gallery (المعرض), Captain Adel (الكابتن عادل).
- Gold is an accent for eyebrows, never a surface or a button.
- Do not place the mark on a busy background or recolour it.
- Arabic copy needs native review before publication.

## Non-affiliation notice

English: Fly GACA is an independent educational platform, not affiliated with, endorsed by, or operated by GACA or the Government of Saudi Arabia. GACA (gaca.gov.sa) is always the authoritative source.

Arabic: فلاي قاكا منظومة تعليمية مستقلة، غير تابعة لهيئة الطيران المدني (GACA) وغير مرتبطة بها ولا معتمدة منها. هيئة الطيران المدني هي المصدر الرسمي.
