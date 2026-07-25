const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

/**
 * Obtiene ruta OSRM entre origen y destino.
 * @returns {{ coordinates: {latitude:number, longitude:number}[], distanceKm: string, durationMin: number }}
 */
export async function fetchOsrmRoute(origin, destination) {
  const fromLng = Number(origin.longitude);
  const fromLat = Number(origin.latitude);
  const toLng = Number(destination.longitude);
  const toLat = Number(destination.latitude);

  if (![fromLng, fromLat, toLng, toLat].every(Number.isFinite)) {
    throw new Error('Coordenadas inválidas para calcular la ruta.');
  }

  const url = `${OSRM_BASE}/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('La API de rutas no respondió correctamente.');
  }

  const data = await response.json();
  const route = data?.routes?.[0];

  if (!route?.geometry?.coordinates?.length) {
    throw new Error('No se encontró una ruta para este destino.');
  }

  const coordinates = route.geometry.coordinates
    .map(([lng, lat]) => ({
      latitude: Number(lat),
      longitude: Number(lng),
    }))
    .filter((p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude));

  if (coordinates.length < 2) {
    throw new Error('La ruta recibida no es válida.');
  }

  return {
    coordinates,
    distanceKm: (Number(route.distance) / 1000).toFixed(1),
    durationMin: Math.max(1, Math.round(Number(route.duration) / 60)),
  };
}

export default { fetchOsrmRoute };
