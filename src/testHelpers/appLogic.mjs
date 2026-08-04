export function computeNewId(currentCount) {
  return `SB-2026-${String(currentCount + 1).padStart(3, '0')}`;
}
