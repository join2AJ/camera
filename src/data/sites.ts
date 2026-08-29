export interface Site {
  name: string;
  count: string;
  online: boolean;
}

export const SITES: Site[] = [
  { name: 'North Campus', count: '12/12', online: true },
  { name: 'Downtown HQ', count: '28/30', online: true },
  { name: 'Warehouse East', count: '9/9', online: true },
  { name: 'Airport Lot', count: '0/6', online: false },
];
