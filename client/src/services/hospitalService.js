// Use Haversine formula to calculate distance in km
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const fetchHospitals = async (lat, lng, filters) => {
  // Replace this with real API later
  const response = await fetch('/mock-data/hospitals.json');
  const data = await response.json();

  return data
    .filter(h =>
      filters.specialty === 'All' || h.specialties.includes(filters.specialty)
    )
    .filter(h => getDistance(lat, lng, h.lat, h.lng) <= filters.radius);
};
