import fetch from 'node-fetch';
import type { Request } from 'express';

export async function fetchHospitalsFromGoogle(req: Request) {
  const lat = req.query.lat;
  const lng = req.query.lng;
  const specialty = req.query.specialty;
  const radius = req.query.radius ? Number(req.query.radius) * 1000 : 10000;
  const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
  if (!lat || !lng || !apiKey) {
    throw new Error('Missing required parameters or API key');
  }
  let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=hospital&key=${apiKey}`;
  if (specialty && specialty !== 'All') {
    url += `&keyword=${encodeURIComponent(specialty as string)}`;
  }
  const response = await fetch(url);
  const data = await response.json();
  if (!data.results) return [];
  return data.results.map((place: any) => ({
    id: place.place_id,
    name: place.name,
    address: place.vicinity,
    lat: place.geometry.location.lat,
    lng: place.geometry.location.lng,
    specialties: [],
    timing: place.opening_hours ? (place.opening_hours.open_now ? 'Open now' : 'Closed') : 'N/A',
    icon: place.icon,
    rating: place.rating
  }));
}
