# RoadResQ Frontend

React + Vite client for the RoadResQ platform. It provides public mechanic discovery flows and an admin dashboard for managing mechanics, users, feedback, donations, and home page settings.

## Stack

- React 19
- TypeScript
- Vite
- React Router DOM
- Tailwind CSS
- Leaflet + React Leaflet
- Axios
- Recharts
- XLSX

## What The App Includes

### Public experience

- Landing page with featured vehicle and service categories
- Map view for nearby mechanics
- List view for searchable mechanic results
- Route preview using OSRM
- Feedback submission flow
- Donation submission flow
- Light and dark theme support

### Admin experience

- Admin login
- Dashboard with summary metrics, recent mechanics, charts, and activity data
- Mechanic create and edit forms
- Bulk mechanic upload from Excel/CSV
- Mechanic approval and status workflows
- Update-request review flow
- User management
- Feedback and donation management
- Vehicle and service type configuration, including featured homepage ordering

## Project Structure

- `src/App.tsx`: route definitions for public and admin areas
- `src/pages/`: public pages and admin screens
- `src/components/`: shared layout, dialogs, pagination, and map helpers
- `src/api/`: API client and endpoint helpers
- `src/contexts/LocationContext.tsx`: browser location state
- `public/`: PWA assets, redirects, service worker, and icons

## Routes

### Public routes

- `/`
- `/map`
- `/list`
- `/feedback`
- `/donate`

### Admin routes

- `/admin/login`
- `/admin/dashboard`
- `/admin/mechanics`
- `/admin/mechanics/new`
- `/admin/mechanics/:id/edit`
- `/admin/mechanics/bulk-upload`
- `/admin/update-requests`
- `/admin/feedback`
- `/admin/donations`
- `/admin/settings`
- `/admin/users`

## Environment Variables

Create a `.env` file in `vehicle-frontend/`.

```env
VITE_API_URL=http://localhost:5000/api
```

## Local Development

```bash
npm install
npm run dev
```

Default dev server: `http://localhost:5173`

## Scripts

- `npm run dev`: start the Vite dev server
- `npm run build`: type-check and create a production build
- `npm run preview`: preview the production build locally
- `npm run lint`: run `oxlint`

## Integration Notes

- Auth tokens are stored in `localStorage` and automatically attached to admin API requests.
- A `401` response clears the saved token and redirects the user to `/admin/login`.
- The map page depends on browser geolocation for the best experience.
- Route rendering uses the public OSRM service.

## Current Implementation Notes

- The frontend builds successfully, but the production bundle is currently very large. The latest build generated a main JS bundle above 10 MB before gzip, so code-splitting is still pending.
- Some admin pages use `fetch` directly while the rest of the app uses the shared Axios client, so API access patterns are not fully standardized yet.
