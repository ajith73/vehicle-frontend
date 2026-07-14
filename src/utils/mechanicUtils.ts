export function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; 
}

export const isCurrentlyAvailable = (mechanic: any) => {
  if (!mechanic) return false;
  if (mechanic.availability === false) return false;
  if (!mechanic.operatingDays || !mechanic.operatingHours) return mechanic.availability !== false;

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = days[new Date().getDay()];
  if (!mechanic.operatingDays.includes(currentDay)) return false;

  try {
    const [openStr, closeStr] = mechanic.operatingHours.split('-').map((s: string) => s.trim());
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const openParts = openStr.split(':');
    const openMinutes = parseInt(openParts[0]) * 60 + parseInt(openParts[1]);
    
    const closeParts = closeStr.split(':');
    const closeMinutes = parseInt(closeParts[0]) * 60 + parseInt(closeParts[1]);

    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  } catch(e) {
    return true;
  }
};

export const getMechanicStatus = (m: any) => m?.currentStatus || (isCurrentlyAvailable(m) ? 'Available' : 'Closed');
