/**
 * Formats elapsed time in milliseconds to MM:SS.ms format
 */
export function formatTime(elapsedMs: number): string {
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((elapsedMs % 1000) / 10); // Show centiseconds

  const paddedMinutes = minutes.toString().padStart(2, '0');
  const paddedSeconds = seconds.toString().padStart(2, '0');
  const paddedMs = milliseconds.toString().padStart(2, '0');

  return `${paddedMinutes}:${paddedSeconds}.${paddedMs}`;
}
