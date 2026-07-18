import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons broken by webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom colored markers
const createIcon = (color) =>
  L.divIcon({
    className: "",
    html: `<div style="
      width: 20px; height: 20px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

const redIcon = createIcon("#ef4444");
const blueIcon = createIcon("#3b82f6");
const greenIcon = createIcon("#22c55e");

// Auto-fit map to show all markers
function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [positions, map]);
  return null;
}

function EmergencyMap({
  patientLat,
  patientLng,
  ambulanceLat,
  ambulanceLng,
  hospitalLat,
  hospitalLng,
  height = "300px",
}) {
  const positions = [];

  if (patientLat && patientLng)
    positions.push([patientLat, patientLng]);
  if (ambulanceLat && ambulanceLng)
    positions.push([ambulanceLat, ambulanceLng]);
  if (hospitalLat && hospitalLng)
    positions.push([hospitalLat, hospitalLng]);

  const center = positions.length > 0 ? positions[0] : [25.5941, 85.1376];

  return (
    <MapContainer
        center={
            formData.latitude && formData.longitude
            ? [parseFloat(formData.latitude), parseFloat(formData.longitude)]
            : [25.5941, 85.1376]
        }
        zoom={15}
        style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {positions.length > 0 && <FitBounds positions={positions} />}

      {patientLat && patientLng && (
        <Marker position={[patientLat, patientLng]} icon={redIcon}>
          <Popup>🚨 Patient Location</Popup>
        </Marker>
      )}

      {ambulanceLat && ambulanceLng && (
        <Marker position={[ambulanceLat, ambulanceLng]} icon={blueIcon}>
          <Popup>🚑 Ambulance</Popup>
        </Marker>
      )}

      {hospitalLat && hospitalLng && (
        <Marker position={[hospitalLat, hospitalLng]} icon={greenIcon}>
          <Popup>🏥 Hospital</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}

export default EmergencyMap;