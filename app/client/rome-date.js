export function dateKeyInRome(value) {
  var date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

export function isTodayInRome(value) {
  return Boolean(value && dateKeyInRome(value) === dateKeyInRome(new Date()));
}
