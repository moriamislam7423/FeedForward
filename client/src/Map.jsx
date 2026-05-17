import { APIProvider, Map as GoogleMap, AdvancedMarker } from '@vis.gl/react-google-maps';

export default function FeedForwardMap({ listings = [] }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="map-fallback">
        <div className="fake-map">
          <span className="map-dot dot-one">Cafe</span>
          <span className="map-dot dot-two">Deli</span>
          <span className="map-dot dot-three">Grocer</span>
        </div>

        <div className="map-fallback-text">
          <strong>Map preview</strong>
          <p>
            Add a Google Maps API key later to show the live map.
          </p>
          <p>{listings.length} listing(s) loaded</p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <GoogleMap
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
      </GoogleMap>
    </APIProvider>
  );
}