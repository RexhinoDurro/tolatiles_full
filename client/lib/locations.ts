export type LocationType = 'florida' | 'jacksonville' | 'st-augustine';

export const VALID_LOCATIONS: LocationType[] = ['florida', 'jacksonville', 'st-augustine'];

export const locationNames: Record<LocationType, string> = {
  florida: 'Florida',
  jacksonville: 'Jacksonville',
  'st-augustine': 'St. Augustine',
};

export const locationFullNames: Record<LocationType, string> = {
  florida: 'Northeast Florida',
  jacksonville: 'Jacksonville, FL',
  'st-augustine': 'St. Augustine, FL',
};

export const geoCoordinates: Record<LocationType, { lat: string; lon: string }> = {
  florida: { lat: '30.1766', lon: '-81.6076' },
  jacksonville: { lat: '30.3322', lon: '-81.6557' },
  'st-augustine': { lat: '29.8912', lon: '-81.3124' },
};

export const areaServed: Record<LocationType, Array<{ '@type': string; name: string; addressRegion: string }>> = {
  florida: [
    { '@type': 'City', name: 'Jacksonville', addressRegion: 'FL' },
    { '@type': 'City', name: 'St Augustine', addressRegion: 'FL' },
    { '@type': 'City', name: 'Ponte Vedra', addressRegion: 'FL' },
    { '@type': 'City', name: 'Orange Park', addressRegion: 'FL' },
  ],
  jacksonville: [
    { '@type': 'City', name: 'Jacksonville', addressRegion: 'FL' },
    { '@type': 'City', name: 'Jacksonville Beach', addressRegion: 'FL' },
    { '@type': 'City', name: 'Orange Park', addressRegion: 'FL' },
    { '@type': 'City', name: 'Mandarin', addressRegion: 'FL' },
  ],
  'st-augustine': [
    { '@type': 'City', name: 'St Augustine', addressRegion: 'FL' },
    { '@type': 'City', name: 'St Augustine Beach', addressRegion: 'FL' },
    { '@type': 'City', name: 'Ponte Vedra', addressRegion: 'FL' },
    { '@type': 'City', name: 'Palm Coast', addressRegion: 'FL' },
  ],
};

export function isValidLocation(location: string): location is LocationType {
  return VALID_LOCATIONS.includes(location as LocationType);
}

export function getLocationName(location: LocationType): string {
  return locationNames[location];
}

export function getLocationFullName(location: LocationType): string {
  return locationFullNames[location];
}
