# Fancy Serial UI

A small browser-based serial-number checker for spotting fancy note patterns.

## What it does
- accepts the supported serial formats: `12345678`, `A12345678`, `12345678B`, and `A12345678B`
- ports the core Python analyzer rules into TypeScript
- shows the **primary verdict** using the analyzer priority order from the original service
- also shows **all matching fancy types** so overlapping patterns stay visible
- is ready for GitHub Pages deployment via Actions

## Local development
```bash
npm install
npm run dev
```

Default local URL:
- `http://127.0.0.1:4173`

## Tests
```bash
npm run test:run
```

The unit tests intentionally mirror representative cases from the original Python analyzer tests, with extra checks around analyzer priority and format validation.

## Build
```bash
npm run build
npm run verify:dist
```

Or run the full local CI sequence:

```bash
npm run ci
```

## GitHub Pages
This repo includes:
- `ci.yml` to lint, test, build, and verify the generated static assets
- `deploy-pages.yml` to publish `dist/` to GitHub Pages from `main`

The Vite config uses a relative asset base so the built site works correctly on GitHub Pages project URLs.

## Source reference
The analyzer logic and expected behavior were derived from the original `serial-analyzer` Python codebase, especially:
- `service/serial_analyzer_service.py`
- the analyzer tests under `analyzers/*_test.py`

## Notes
- There is no backend; all analysis runs in the browser.
- Keeping `"private": true` in `package.json` prevents accidental npm publishing even if the GitHub repo later becomes public.
