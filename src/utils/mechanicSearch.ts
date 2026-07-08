export type MechanicSort = 'Nearest' | 'Available';
export type MechanicFilterValue = string | string[];

export interface MechanicQueryState {
  search?: string;
  vehicle?: MechanicFilterValue;
  service?: MechanicFilterValue;
  radius?: number;
  sort?: MechanicSort;
  routeTo?: string | number;
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
  if (state.routeTo !== undefined && state.routeTo !== null && String(state.routeTo).trim()) {
    params.set('routeTo', String(state.routeTo));
  }

  return params;
}
