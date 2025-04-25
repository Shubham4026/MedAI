// Declaration file for src/utils/geolocation.js

declare module '@/utils/geolocation' {
  export function getUserLocation(): Promise<{ lat: number; lng: number }>;
}
