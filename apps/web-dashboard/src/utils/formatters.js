export function formatTimestamp(ts) {
  if (!ts) return "-";
  try {
    const d = new Date(ts);
    return d.toLocaleString();
  } catch {
    return ts;
  }
}
