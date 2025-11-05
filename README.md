# SmartSpender (MVP)

SmartSpender is a mobile-first receipt scanner built with Expo + React Native. Capture or import receipt photos, analyse them with OpenAI GPT-4o, auto-categorise items, and keep expenses on the device. Everything is processed client-side apart from the single OpenAI request.

## Features

- Capture receipts with the camera or import from the gallery.
- Async processing pipeline with progress feedback.
- OpenAI GPT-4o Mini analysis for merchant, totals, and line items.
- Extract merchant, date, totals, line items, and guess categories.
- Review & edit receipts, view history, delete unwanted entries.
- Export filtered receipts to CSV and share via the native share sheet.
- All data (metadata + images) stored locally with `AsyncStorage` and `expo-file-system`.

## Quick Start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

Add your OpenAI key (with GPT-4o access) to your `.env` or shell before starting Expo:

```bash
export EXPO_PUBLIC_OPENAI_API_KEY=sk-...
export EXPO_PUBLIC_OPENAI_MODEL=gpt-4o-mini # Optional override (defaults to gpt-4o-mini)
```

3. **Run the app**

   ```bash
   npx expo start
   ```

  Open the development server with Expo Go (works because the OpenAI call runs from the client) or run a development build/simulator. Camera and media-library permissions will be requested at runtime.

## Project Structure

- `app/` — Expo Router screens.
- `src/constants/` — currencies, categories, pipeline steps.
- `src/state/` — reducer, context provider, and actions for receipts and jobs.
- `src/services/` — OpenAI receipt analysis, categorisation, CSV export.
- `src/pipeline/` — orchestrates preprocessing, AI analysis, and persistence.
- `src/storage/` — AsyncStorage + FileSystem helpers for receipts and images.
- `src/screens/` — UI modules for home, processing, review, history, export.
- `src/components/` — Reusable UI pieces (buttons, cards, progress indicator, etc.).

## Known Limitations & TODOs

- Cropping UI is not implemented yet (`TODO` left in code for future enhancement).
- OpenAI responses are validated with Zod, but receipts may still require manual review.
- No auth or sync — everything remains on-device.

## Development Notes

- Default currency is BGN (`src/constants/app.ts`).
- Categories are defined in `src/constants/categories.ts` and can be customised.
- AI analysis uses `EXPO_PUBLIC_OPENAI_API_KEY`; without it the pipeline cannot run.
- When deleting receipts the image file is removed from local storage.

Enjoy scanning! Let me know if you run into any issues or want to extend the MVP.
