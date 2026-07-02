# MechanicFinder Frontend

The frontend for **MechanicFinder** – an on-demand vehicle repair platform designed to help users instantly locate, route to, and contact nearby mechanics in emergency breakdown situations.

Built with performance and premium UI aesthetics in mind, utilizing modern web tools and mapping engines.

## 🚀 Technologies Used
- **Framework**: React 19 + Vite
- **Language**: Strict TypeScript (`verbatimModuleSyntax` enforced)
- **Styling**: Tailwind CSS + `lucide-react` icons
- **Maps**: React-Leaflet + Leaflet Marker Cluster
- **Routing**: React Router DOM (v7)

## 🎨 Core Features
- **Interactive Draggable Map**: Dynamic Leaflet maps with custom marker clustering, bounding optimizations, and a native-feeling draggable bottom sheet.
- **Dynamic Routing Options**: Integrated with OSRM to provide driving distances, ETA, and Fastest/Shortest route options.
- **Micro-animations**: Premium user interface with smooth transitions, hover effects, and skeleton loaders.
- **Administrative Dashboard**: Protected routes for admins to monitor platform metrics, approve mechanics, and view user feedback.
- **Vercel Ready**: Pre-configured `vercel.json` for seamless SPA deployment.

## 🛠️ Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
# Point this to your backend server. If deployed, use the production backend URL.
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Development Server
```bash
npm run dev
```

## ☁️ Deployment (Vercel)
This project is configured out-of-the-box for **Vercel**.
1. Push this repository to GitHub.
2. Import the project into your Vercel Dashboard.
3. Ensure the Framework Preset is set to **Vite**.
4. Under Environment Variables, add `VITE_API_URL` pointing to your hosted backend (e.g., `https://my-backend.vercel.app/api`).
5. Deploy! (The included `vercel.json` automatically handles SPA routing fallback to `index.html`).
