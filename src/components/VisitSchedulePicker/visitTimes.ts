// Sem React nem CSS: roda no node --test (COVG-03).
export function timeToMinutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

export function formatMinutes(minutes: number) {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return minute === 0
    ? `${String(hour).padStart(2, "0")}h`
    : `${String(hour).padStart(2, "0")}h${String(minute).padStart(2, "0")}`;
}

export function groupVisitTimes(times: string[]) {
  const values = Array.from(new Set(times.map(timeToMinutes))).sort(
    (a, b) => a - b,
  );
  if (values.length === 0) return [];
  const groups: Array<{ start: number; end: number }> = [];
  let start = values[0];
  let previous = values[0];
  values.slice(1).forEach((value) => {
    if (value === previous + 30) previous = value;
    else {
      groups.push({ start, end: previous + 30 });
      start = previous = value;
    }
  });
  groups.push({ start, end: previous + 30 });
  return groups.map(
    ({ start: groupStart, end }) =>
      `${formatMinutes(groupStart)}–${formatMinutes(end)}`,
  );
}
