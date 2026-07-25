import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export function useUserLocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(Platform.OS !== 'web');

  useEffect(() => {
    if (Platform.OS === 'web') {
      setLoading(false);
      return undefined;
    }

    let mounted = true;

    (async () => {
      try {
        const Location = await import('expo-location');
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          if (mounted) setError('Permiso de ubicación denegado.');
          return;
        }

        const current = await Location.getCurrentPositionAsync({});
        if (mounted) {
          setLocation({
            latitude: current.coords.latitude,
            longitude: current.coords.longitude,
          });
        }
      } catch (err) {
        if (mounted) setError(err.message || 'No se pudo obtener ubicación.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return { location, error, loading };
}

export default useUserLocation;
