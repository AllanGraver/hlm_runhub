# RunHub

[▶ Åbn RunHub](https://allangraver.github.io/hlm_runhub/)

Samlet Vite/React-app med ExcelParserV2 til HLM-matrixen.

## Lokalt

```bash
npm install
npm test
npm run dev
```

## GitHub Pages

GitHub Actions tester og bygger appen og udgiver den automatisk til GitHub Pages ved push til `main`. Vælg **GitHub Actions** som Pages source under **Settings → Pages**.

## Strava

Forbindelsesknappen findes øverst på siden **Træning**. GitHub Actions bruger repository-variablen `VITE_STRAVA_API_URL` til Cloudflare Workerens base-URL. Workerens `FRONTEND_URL` skal tillade `https://allangraver.github.io`. Strava-adgangskoder og OAuth-tokens skal kun ligge i Workerens hemmeligheder — ikke i frontend eller repository.

RunHub bruger Workerens `/api/runhub/athlete` og paginerede `/api/runhub/activities`-endpoints til at hente løbeture fra de seneste 90 dage. OAuth-start kaldes med `app=runhub`. Aktivitetsdetaljer, streams, omgange og zoner hentes først, når en løbetur åbnes, via `/api/runhub/activity/:id`, `/streams`, `/laps` og `/zones`. Workerens `/api/status` og `/api/disconnect` bruges fortsat til forbindelsesstatus og afbrydelse.

## AI Coach

AI-coachen analyserer ugentlige træningsopsummeringer fra de seneste 12 uger sammen med et gemt mål og en matchende plan. Aktivitetsnavne, ID'er, GPS-data og individuelle løbeture sendes ikke. Den kræver Workerens `/api/runhub/coach`-endpoint og Cloudflare Workers AI-binding; deploy Worker-opdateringen i `AllanGraver/runstreak`, før AI-analysen kan bruges. AI-forslag er generelle og ikke medicinsk rådgivning.