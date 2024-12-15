import { GOOGLE_MAPS_API_KEY } from "@env";

export const MAP_CONFIG = {
  GOOGLE_MAPS_API_KEY,
  DEFAULT_REGION: {
    latitude: 20.5937,
    longitude: 78.9629,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  },
  MAP_STYLE: {
    height: 200,
    width: "100%",
    borderRadius: 8,
  },
};
