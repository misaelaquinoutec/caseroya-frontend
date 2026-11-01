import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export interface LocationState {
  coords: { latitude: number; longitude: number } | null;
  errorMsg: string | null;
  isLoading: boolean;
}

export function useLocation(): LocationState {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function getCurrentLocation() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (isMounted) {
            setErrorMsg('Permiso de GPS denegado por el usuario.');
            setIsLoading(false);
          }
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (isMounted) {
          setCoords({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setErrorMsg((err as Error)?.message || 'No se pudo obtener la ubicación.');
          setIsLoading(false);
        }
      }
    }

    getCurrentLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  return { coords, errorMsg, isLoading };
}
