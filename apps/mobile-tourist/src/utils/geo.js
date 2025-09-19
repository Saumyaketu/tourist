export function haversineKm(aLat, aLng, bLat, bLng) {
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(aLat - bLat);
  const dLng = toRad(aLng - bLng);
  const A = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const C = 2 * Math.atan2(Math.sqrt(A), Math.sqrt(1 - A));
  return 6371 * C;
}
