export type MechanicSort = 'Nearest' | 'Available';
export type MechanicFilterValue = string | string[];

export interface MechanicQueryState {
  search?: string;
  vehicle?: MechanicFilterValue;
  service?: MechanicFilterValue;
  radius?: number;
  sort?: MechanicSort;
  availability?: 'All' | 'Available' | 'Not Available';
  routeTo?: string | number;
  lat?: number;
  lng?: number;
  page?: number;
  limit?: number;
}

const normalizeMultiValue = (value?: MechanicFilterValue) => {
  if (!value) return [];
  const items = Array.isArray(value) ? value : value.split(',');
  return items.map((item) => item.trim()).filter(Boolean);
};

export function parseMechanicFilterParam(value?: string | null): string[] {
  if (!value) return [];
  return normalizeMultiValue(value);
}

export function buildMechanicSearchParams(state: MechanicQueryState): URLSearchParams {
  const params = new URLSearchParams();

  if (state.search?.trim()) params.set('search', state.search.trim());
  const vehicles = normalizeMultiValue(state.vehicle);
  const services = normalizeMultiValue(state.service);
  if (vehicles.length > 0) params.set('vehicle', vehicles.join(','));
  if (services.length > 0) params.set('service', services.join(','));
  if (typeof state.radius === 'number' && Number.isFinite(state.radius)) params.set('radius', String(state.radius));
  if (state.sort) params.set('sort', state.sort);
  if (state.availability && state.availability !== 'All') params.set('availability', state.availability);
  if (state.routeTo !== undefined && state.routeTo !== null && String(state.routeTo).trim()) {
    params.set('routeTo', String(state.routeTo));
  }
  if (state.lat !== undefined && state.lng !== undefined) {
    params.set('lat', String(state.lat));
    params.set('lng', String(state.lng));
  }
  if (state.page) params.set('page', String(state.page));
  if (state.limit) params.set('limit', String(state.limit));

  return params;
}
