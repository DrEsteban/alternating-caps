# Copilot Instructions for Alternating Caps Converter

## Project Overview

This is a Progressive Web App (PWA) that converts text to alternating caps format (e.g., "hAvE yOu EvEr").

## Technology Stack

- **Language**: TypeScript (ES2023 target)
- **Runtime**: Browser (DOM environment)
- **Build Tool**: TypeScript Compiler (tsc)
- **Deployment**: Azure Static Web Apps
- **No Framework**: Vanilla TypeScript with direct DOM manipulation

## Project Structure

- `wwwroot/`: Contains all web assets
  - `script.ts`: Main TypeScript source file
  - `index.html`: Main HTML file
  - `style.css`: Styling
  - `service-worker.js`: PWA service worker
  - `manifest.webmanifest`: PWA manifest
  - Images: `favicon.ico`, `icon-192.png`, `icon-512.png`
- `tsconfig.json`: TypeScript configuration
- `.github/workflows/`: CI/CD pipeline for Azure deployment

## Building and Testing

### Build Commands

```bash
# Install TypeScript globally
npm install -g typescript

# Compile TypeScript to JavaScript
tsc
```

The TypeScript compiler generates `script.js` from `script.ts` in the `wwwroot/` directory.

### Deployment

The project uses Azure Static Web Apps for hosting. The CI/CD workflow:
1. Compiles TypeScript with `tsc`
2. Copies web assets (HTML, JS, CSS, images, manifest) to a publish directory
3. Deploys to Azure Static Web Apps

## Code Style and Conventions

### TypeScript

- **Strict mode enabled**: All TypeScript strict checks are enforced
- **Type annotations**: Use explicit type annotations for function parameters and return types
- **ES Modules**: Use `esModuleInterop` for module compatibility
- **No comments in output**: Comments are removed during compilation (`removeComments: true`)

### DOM Manipulation

- Use direct DOM API calls with type assertions
- Cache DOM elements in global variables after `DOMContentLoaded`
- Example pattern:
  ```typescript
  var elementName: HTMLElementType;
  document.addEventListener('DOMContentLoaded', () => {
    elementName = document.getElementById('id') as HTMLElementType;
  });
  ```

### Function Naming

- Use descriptive camelCase names
- Prefer simple, clear function names that describe actions
- Example: `alternateCaps()`, `saveSettings()`, `copyToClipboard()`

### Local Storage

- Store settings in localStorage with versioned keys
- Format: `settings-${version}`
- Always serialize/deserialize using JSON

### Service Worker

- PWA service worker registration is handled in `script.ts`
- Register service worker on window load event

## Features to Preserve

1. **Alternating caps conversion**: Core algorithm that alternates letter case
2. **Settings persistence**: Save user preferences (capital start, randomness, ratio) in localStorage
3. **Randomness option**: Allow controlled randomization of case alternation
4. **Copy to clipboard**: Output text can be copied with visual feedback
5. **PWA functionality**: App is installable and works offline

## Development Guidelines

- Keep the app lightweight and simple
- Maintain PWA functionality (manifest, service worker, icons)
- Preserve backward compatibility with stored settings
- Use modern browser APIs (async/await, clipboard API)
- Handle edge cases (non-letter characters, empty input)
- Validate user input (e.g., random ratio bounds 0-100)

## Important Implementation Details

- **Non-letter characters**: Don't count towards alternation (spaces, punctuation, etc.)
- **Counter logic**: Only increment letter counter for actual letters
- **Randomness**: Applied per letter based on ratio (0-100%)
- **First letter handling**: Special case when randomness is enabled
