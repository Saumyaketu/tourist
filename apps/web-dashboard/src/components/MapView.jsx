import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

/**
 * props:
 *  - center: [lat, lng]
 *  - zoom: number
 *  - markers: [{id, lat, lon, title, body}]
 */
export default function MapView({ center = [26.1445, 91.7362], zoom = 7, markers = [] }) {
  return (
    <div style={{ height: "400px", width: "100%", borderRadius: 8, overflow: "hidden" }}>
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {markers.map((m) => (
          <Marker key={m.id} position={[m.lat, m.lon]}>
            <Popup>
              <strong>{m.title}</strong>
              <div>{m.body}</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
