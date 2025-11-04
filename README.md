# SmartSpender (MVP)

SmartSpender is a mobile-first receipt scanner built with Expo + React Native. Capture or import receipt photos, send them to OCR.Space for text extraction, auto-categorise items, and keep expenses on the device. Everything is processed client-side except the OCR call.

## Features

- Capture receipts with the camera or import from the gallery.
- Async processing pipeline with progress feedback.
- OCR via OCR.Space (single provider) with a mock fallback for demos.
- Heuristics to confirm the photo is a receipt before parsing.
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

   Add an OCR.Space API key (or enable the mock) to your `.env` or shell before starting Expo:

   ```bash
   export EXPO_PUBLIC_OCR_SPACE_API_KEY=your_key_here
   # Optional: fall back to mocked OCR responses for demos
   # export EXPO_PUBLIC_USE_MOCK_OCR=true
   ```

3. **Run the app**

   ```bash
   npx expo start
   ```

   Open the development server with Expo Go (works because OCR is cloud-based) or run a development build/simulator. Camera and media-library permissions will be requested at runtime.

## Project Structure

- `app/` — Expo Router screens.
- `src/constants/` — currencies, categories, pipeline steps, API endpoints.
- `src/state/` — reducer, context provider, and actions for receipts and jobs.
- `src/services/` — OCR provider, heuristics, parsing, categorisation, and CSV export.
- `src/pipeline/` — orchestrates preprocessing, OCR, parsing, and persistence.
- `src/storage/` — AsyncStorage + FileSystem helpers for receipts and images.
- `src/screens/` — UI modules for home, processing, review, history, export.
- `src/components/` — Reusable UI pieces (buttons, cards, progress indicator, etc.).

## Known Limitations & TODOs

- Cropping UI is not implemented yet (`TODO` left in code for future enhancement).
- OCR keys are bundled in the client for now — use the mock mode or proxy in production.
- Receipt parsing relies on heuristics and may need tuning for diverse receipt formats.
- No auth or sync — everything remains on-device.

## Development Notes

- Default currency is BGN (`src/constants/app.ts`).
- Categories are defined in `src/constants/categories.ts` and can be customised.
- The OCR pipeline uses `EXPO_PUBLIC_USE_MOCK_OCR` when the API key is missing so you can demo without a network call.
- When deleting receipts the image file is removed from local storage.

Enjoy scanning! Let me know if you run into any issues or want to extend the MVP.
