This is a TypeScript-based Progressive Web App (PWA) that converts text to alternating caps format (e.g., "hAvE yOu EvEr"). The app is a lightweight, frameworkless web application deployed to Azure Static Web Apps.

## Code Standards

### Required Before Each Commit
- Ensure TypeScript compiles without errors: `tsc`
- Verify the compiled `script.js` is generated in `wwwroot/`
- Do not commit `script.js` (it's in `.gitignore` and rebuilt during deployment)

### Development Flow
- **Build**: `tsc` (compiles TypeScript to JavaScript)
- **No tests currently**: This project doesn't have automated tests yet
- **Local development**: Open `wwwroot/index.html` in a browser or use a local web server

## Repository Structure

- `wwwroot/`: All web assets (HTML, CSS, TypeScript, and compiled JS)
  - `script.ts`: Main TypeScript source file (200+ lines)
  - `index.html`: Main HTML file
  - `style.css`: Styling
  - `service-worker.js`: PWA service worker for offline functionality
  - `manifest.webmanifest`: PWA manifest
  - `favicon.ico`, `icon-192.png`, `icon-512.png`: App icons
- `tsconfig.json`: TypeScript configuration (ES2023 target, strict mode)
- `.github/workflows/`: Azure Static Web Apps CI/CD pipeline

## Key Guidelines

1. **Follow TypeScript strict mode**: All strict checks are enforced in `tsconfig.json`
2. **Use explicit type annotations**: Functions should have typed parameters and return types
3. **Maintain frameworkless architecture**: No frameworks - use vanilla TypeScript with direct DOM manipulation
4. **Preserve PWA functionality**: Maintain service worker, manifest, and offline capabilities
5. **Keep settings backward compatible**: Settings are stored in localStorage with versioned keys (`settings-${version}`)
6. **Use modern browser APIs**: Leverage async/await, clipboard API, and other modern features
7. **Cache DOM elements**: Retrieve and cache elements in global variables during `DOMContentLoaded`
8. **Validate user input**: Ensure inputs like random ratio stay within valid bounds (0-100)

## Code Conventions

### TypeScript Patterns

- Use `var` for global variables (not `let` or `const`) that are initialized after `DOMContentLoaded`
- Use explicit type assertions when getting DOM elements: `document.getElementById('id') as HTMLInputElement`
- Example DOM caching pattern:
  ```typescript
  var capitalCheckbox: HTMLInputElement;
  document.addEventListener('DOMContentLoaded', () => {
    capitalCheckbox = document.getElementById('capitalCheckbox') as HTMLInputElement;
  });
  ```

### Function Naming

- Use descriptive camelCase: `alternateCaps()`, `saveSettings()`, `copyToClipboard()`
- Name functions clearly to describe their action

### Settings Persistence

- Settings are stored as JSON in localStorage
- Use type-safe deserialization: `const parsedSettings: Settings = JSON.parse(settings)`
- Settings type: `{ capital: boolean, randomness: boolean, randomRatio: string }`

## Core Algorithm Details

The alternating caps algorithm has important implementation details:

- **Non-letter characters** (spaces, punctuation) don't count toward alternation
- **Letter counter** only increments for actual letters (using `/[a-zA-Z]/.test(char)`)
- **Randomness feature** allows controlled case flipping based on a 0-100% ratio
- **First letter handling** has special logic when randomness is enabled
- **Case alternation** uses modulo logic: `(j % 2 === 0) === startWithCapital`

## Important Features to Preserve

1. Alternating caps conversion algorithm
2. Settings persistence in localStorage
3. Randomness option with configurable ratio
4. Copy to clipboard with visual feedback (tooltip)
5. PWA installability and offline functionality
6. Service worker registration on window load
