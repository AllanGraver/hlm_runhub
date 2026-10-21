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

Workerens `/api/sync` skal returnere en `activities`-liste for at importere træning pr. dato. Den nuværende Worker returnerer kun samlede statistikker, så login kan forbindes, men aktivitetsimport pr. dato kræver en udvidelse af Workerens svar.