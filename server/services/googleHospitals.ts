import fetch from 'node-fetch';
import type { Request } from 'express';

export async function fetchHospitalsFromGoogle(req: Request) {
  const lat = req.query.lat;
  const lng = req.query.lng;
  const specialty = req.query.specialty as string;
  const radius = req.query.radius ? Number(req.query.radius) * 1000 : 10000; // Convert km to meters, default 10km
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

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

  // Return basic info from Nearby Search, map place_id to id
  return data.results.map((place: any) => ({
    id: place.place_id, // Use place_id as the unique identifier
    businessStatus: place.business_status, // Add business status
    name: place.name,
    icon: place.icon, // Add icon URL
    iconBackgroundColor: place.icon_background_color, // Add icon background color
    rating: place.rating, // Add rating
    address: place.vicinity, // Nearby search usually provides vicinity
    lat: place.geometry.location.lat,
    lng: place.geometry.location.lng,
  }));
}

// New function to fetch details for a single place
export async function fetchPlaceDetails(placeId: string) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error('Missing Google API key');
  }

  const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,vicinity,geometry,opening_hours,icon,rating,formatted_phone_number&key=${apiKey}`;

  try {
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();

    if (detailsData.status !== 'OK') {
      throw new Error(`Google Place Details API error: ${detailsData.status} - ${detailsData.error_message || 'Unknown error'}`);
    }

    const result = detailsData.result;

    // Return a structured object with the needed details
    return {
      id: placeId,
      name: result.name,
      address: result.vicinity,
      lat: result.geometry?.location?.lat,
      lng: result.geometry?.location?.lng,
      timing: result.opening_hours ? (result.opening_hours.open_now ? 'Open now' : 'Closed') : 'N/A',
      icon: result.icon,
      rating: result.rating,
      formatted_phone_number: result.formatted_phone_number || null
    };
  } catch (error: any) {
    console.error(`Failed to fetch details for place_id ${placeId}:`, error);
    throw new Error(`Failed to fetch place details: ${error.message}`);
  }
}
