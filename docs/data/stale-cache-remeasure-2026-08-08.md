# Stale-cache hermeting + 24-uursvenster — 2026-08-08

Gate-check c en d voor de Netherlands-redirectimport
(`netherlands-market-redirect-import/README.md`). Meting uitgevoerd
2026-08-08 07:17–07:19 UTC vanaf direct egress, sequentieel met 2,5 s
tussenruimte (geen parallelle burst, geen Cloudflare-challenge uitgelokt).

## Gate c — stale-cacheratio: 0/30 = 0%

30 requests zonder cache-buster: 10 URL's × 3 user agents (Chrome 127,
Googlebot 2.1, curl/8.10.1). URL-set: homepage ×3 locales, 3 productpagina's
(incl. de eerder intermitterende Ette Tete STEP UP), collectie, pagina,
artikel, EN-product.

Resultaat, alle 30 requests:

- HTTP 200: 30/30
- `Shopify.theme.id` in body = 203715215697 (live thema): 30/30
- `cf-cache-status: DYNAMIC`: 30/30 — geen enkele cache-HIT, dus geen
  route waarlangs een verouderde body geserveerd kan worden
- `Liquid error` / `Could not find asset`: 0/30
- Product/ProductGroup-schema op de 9 productpagina-responses: 9/9 aanwezig
- Cloudflare-challenges: 0

Ruwe per-request log (volgnr | UA | pad | status | cache | thema | schema |
x-request-id) staat in de sessie-uitvoer; request-ID-reeks
`b89077c7-…-1786173472` t/m `2fb6f15b-…-1786173555`.

## Gate d — 24 uur zonder incidenten: NIET voldaan

- Publicatiemoment live thema 203715215697: het thema is **aangemaakt**
  2026-08-07T23:08:33+02:00; rollback-thema 203713249617 kreeg zijn laatste
  update 23:10:05+02:00 (rolwissel). Publicatie ≈ 2026-08-07T21:09Z.
- Meetmoment: 2026-08-08T07:17Z → **± 10 u 08 m verstreken**. 24 uur is op
  zijn vroegst vol op **2026-08-08 ± 21:09Z (23:09 CET)**.
- Het live thema is bovendien binnen het venster gemuteerd:
  `templates/robots.txt.liquid` op **2026-08-08T09:08:14+02:00 (07:08Z)**
  (commit f27c526 "Unblock theme assets and checkout preloads in
  robots.txt"). Enige asset gewijzigd sinds publicatie. Als dit als
  remediatie/wijziging telt die de klok herstart, is het venster op zijn
  vroegst vol op **2026-08-09 07:08Z**.
- Er bestaat geen continu monitoringlog over het venster; de execution-log
  vermeldt de observatieklok als "not started". De sweep hierboven is een
  schone momentopname (0 incidentsignalen), maar bewijst het verleden venster
  niet.

## Consequentie

Uitvoering (NL-subfolders, frontpage-depublicatie, batch 00–04) niet gestart.
Wachten op besluit eigenaar over gate d.
