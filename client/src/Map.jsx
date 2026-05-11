import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';

export default function FeedForwardMap() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        defaultCenter={{ lat: 40.7128, lng: -74.006 }}
        defaultZoom={12}
        mapId="feedforward-map"
        style={{
          width: '100%',
          height: '320px',
          borderRadius: '18px'
        }}
      >
        <AdvancedMarker position={{ lat: 40.7128, lng: -74.006 }} />
      </Map>
    </APIProvider>
  );
}