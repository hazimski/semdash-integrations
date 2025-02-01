export function getDifficultyColor(kd: number): string {
  if (kd <= 25) return '#5addaa';
  if (kd <= 50) return '#009f80';
  if (kd <= 75) return '#FDC13C';
  return '#FE4952';
}
