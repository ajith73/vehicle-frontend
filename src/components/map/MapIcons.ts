import L from 'leaflet';

export const userIcon = new L.DivIcon({
  className: 'bg-transparent border-none',
  html: `<div class="w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-[pulse_2s_ease-in-out_infinite]"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export const getMarkerIcon = (colorClass: string) => new L.DivIcon({
  className: 'bg-transparent border-none',
  html: `<div class="relative w-8 h-8 ${colorClass} rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white">
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
           <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 ${colorClass} rotate-45 border-r-2 border-b-2 border-white"></div>
         </div>`,
  iconSize: [32, 36],
  iconAnchor: [16, 36],
});

export const availableIcon = getMarkerIcon('bg-green-500');
export const closedIcon = getMarkerIcon('bg-red-500');
export const selectedIcon = new L.DivIcon({
  className: 'bg-transparent border-none',
  html: `<div class="relative flex h-12 w-12 items-center justify-center">
           <div class="absolute inset-0 rounded-full bg-blue-500/25 animate-ping"></div>
           <div class="relative flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white border-2 border-white shadow-xl">
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="currentColor"/></svg>
           </div>
         </div>`,
  iconSize: [48, 48],
  iconAnchor: [24, 40],
});

export const getIconForStatus = (status: string) => {
  if (status === 'Available') return availableIcon;
  return closedIcon;
};
