# Greenpro Environmental - AI Coding Agent Instructions

## Project Overview
Greenpro Environmental is a single-page React application for a demolition and waste removal service. The app handles customer quotes, online booking, and payment processing integrations.

**Tech Stack:**
- React 19.2.0 with Hooks (useState only)
- TailwindCSS (via CDN) for styling
- Create React App (CRA) 5.0.1
- Jest + React Testing Library for testing
- No backend code in this repo

**Key Files:**
- `src/App.js` - Main monolithic component with all sections
- `public/index.html` - Entry point
- `package.json` - Scripts: `start`, `build`, `test`, `eject`

## Architecture & Data Flow

### Component Structure (All in App.js)
The app is organized as a single-file React component with internal sub-components:
- `Header()` - Navigation with logo and links
- `Hero()` - Hero section with CTA buttons
- `Services()` - 4-service cards grid (demolition, drywall, cleanup, garbage)
- `Gallery()` - Placeholder for project gallery images
- `App()` - Main component handling two complex forms

### Forms & API Integration
**Quote Form (`q` state):**
- Fields: name, phone, email, service type, area (sq ft), rooms, description
- API: `POST /api/estimate` → returns `{ estimate_low, estimate_high, currency, explanation }`
- Triggers auto-reply email to customer
- "Pay Deposit" button calculates 20% of estimate and calls Stripe checkout

**Booking Form (`booking` state):**
- Fields: name, email, phone, date, time, service type
- API: `POST /api/book` → returns `{ success: true }`
- Success triggers confirmation message

**Payment Integration:**
- `POST /api/create-checkout-session` with `{ amount, email }`
- Returns Stripe checkout URL for redirect

### State Management
Use React hooks (useState only). Quote form state uses shallow merging pattern:
```javascript
setQ({ ...q, fieldName: e.target.value })
```
Follow this pattern for all form state updates.

### Styling
- **TailwindCSS via CDN** - all classes available in markup
- Color scheme: Emerald/Green gradient (`from-emerald-700 to-green-600`)
- Responsive: `hidden md:flex` for mobile-first responsive design
- Utility classes: `max-w-6xl mx-auto px-6` for layout, `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4` for grids

## Development Workflows

### Local Development
```bash
npm start          # Runs on http://localhost:3000, auto-reload on file changes
npm test           # Jest watch mode for running tests
npm run build      # Production build → build/ folder
npm run eject      # One-way: eject from CRA (avoid unless necessary)
```

### Backend Integration Points (Not in This Repo)
When implementing backend endpoints, expect this contract:
- **GET/POST /api/estimate** - Quote estimation engine (likely AI-powered)
- **POST /api/book** - Appointment scheduling
- **POST /api/create-checkout-session** - Stripe payment session creation

Mock these locally or use a separate backend repo.

## Key Patterns & Conventions

### Error Handling
- Wrap fetch calls in try/catch; log to console
- Display user-friendly error messages via component state (e.g., `setMessage()`)
- Example: `Could not get estimate now.` on failure

### Responsive Design
- Default mobile-first: single column layouts
- Breakpoints: `md:` (tablet), `lg:` (desktop)
- Never use inline styles; all styling via TailwindCSS classes

### Asset Fallback
- Logo uses `PUBLIC_LOGO_PATH = '/assets/greenpro-logo.png'` with SVG fallback
- `onError` handler switches to `FALLBACK_DATA_URI` (data URL SVG)
- Pattern: Graceful degradation for missing assets

### Form Input Binding
- Use controlled inputs with state: `value={q.name} onChange={(e) => setQ({ ...q, name: e.target.value })}`
- Apply consistent `className="border p-3 rounded"` to all inputs
- Use `md:col-span-2` for full-width inputs in 2-column grid

## Integration Points & External Dependencies

### Service Types
Four fixed services (no DB): "Interior Demolition", "Drywall Removal", "Site Clean-Up", "Garbage Removal"  
Update both quote and booking form `<select>` elements if adding services.

### Contact Info (Footer & Contact Section)
- Phone: 778-836-7218
- Email: info@greenprogroup.com
- Company: Greenpro Environmental Ltd.

**To update contact info:** Search for phone/email strings in App.js and update all occurrences.

### Image Assets
- `public/assets/greenpro-logo.png` - Logo file (add if missing)
- `public/assets/gallery/` - Project gallery images (placeholder section shows 6 cards)

## Testing Strategy
- Use `@testing-library/react` for component tests
- Example test location: `src/App.test.js`
- Run with `npm test` for watch mode; `npm test -- --coverage` for coverage

## Common Tasks

### Adding a New Form Field
1. Add field to state object (quote or booking)
2. Add `<input>` with `value={state.field}` and `onChange` handler
3. Include field in JSON when calling API endpoint
4. Update corresponding API endpoint to handle new field

### Modifying Services List
1. Update `services` array in `Services()` component
2. Update service options in both `<select>` elements (quote & booking forms)

### Styling Changes
- Add/modify TailwindCSS class names directly (no CSS files needed)
- Test responsiveness at md/lg breakpoints
- Use `bg-emerald-*` and `text-white` for brand consistency

## Notes for AI Agents
- This is a **frontend-only** SPA; backend code lives elsewhere
- No state management library (Redux/Zustand); use React hooks
- TailwindCSS provides all styling—do not create CSS files
- The app expects backend APIs to exist; mock or stub them for local testing
- Service options are hardcoded; scaling to dynamic services requires API integration
- All form data flows to API endpoints; backend must validate and process
