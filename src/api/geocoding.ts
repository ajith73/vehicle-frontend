import axios from 'axios';

export interface PlaceSuggestion {
  name: string;
  lat: number;
  lon: number;
}

interface NominatimSearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

interface NominatimReverseResult {
  address?: {
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
    county?: string;
    state_district?: string;
  };
}

const NOMINATIM_HEADERS = {
  Accept: 'application/json'
};

export async function searchPlaces(query: string): Promise<PlaceSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) {
    return [];
  }

  const response = await axios.get<NominatimSearchResult[]>('https://nominatim.openstreetmap.org/search', {
    params: {
      format: 'json',
      q: trimmed
    },
    headers: NOMINATIM_HEADERS
  });

  return Array.isArray(response.data)
    ? response.data.map((item) => ({
        name: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon)
      }))
    : [];
}

export async function reverseGeocodeName(coords: [number, number]): Promise<string> {
  const response = await axios.get<NominatimReverseResult>('https://nominatim.openstreetmap.org/reverse', {
    params: {
      format: 'json',
      lat: coords[0],
      lon: coords[1]
    },
    headers: NOMINATIM_HEADERS
  });

  const address = response.data?.address;
  return address?.city
    || address?.town
    || address?.village
    || address?.suburb
    || address?.county
    || address?.state_district
    || 'Pinned Location';
}
