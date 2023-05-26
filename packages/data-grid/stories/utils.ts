export function randomString(length = 20) {
  const abc = "abcdefghijklmnopqrstuvwxyz";
  const name: string[] = [];
  for (let i = 0; i < length; ++i) {
    name.push(abc[Math.floor(Math.random() * abc.length)]);
  }
  return name.join("");
}

export function randomText(w: number, min: number, max: number) {
  const words: string[] = [];
  for (let i = 0; i < w; ++i) {
    words.push(randomString(Math.floor(Math.random() * (max - min + 1)) + min));
  }
  let text = words.join(" ");
  text = text[0].toUpperCase() + text.slice(1);
  return text;
}

export function randomNumber(min: number, max: number, precision = 2) {
  const r = max - min;
  const m = 10 ** precision;
  return Math.round((Math.random() * r + min) * m) / m;
}

export function randomAmount(min = 0, max = 10000000, precision = 2) {
  const m = max * Math.pow(10, precision);
  const d = Math.pow(10, -precision);
  return Math.round(Math.random() * m) * d;
}

export function randomItem<T>(options: T[]): T {
  return options[Math.floor(Math.random() * options.length)];
}

export function randomPercentage() {
  return Math.random() * 100;
}

export function randomStatus() {
  const statuses = ["Cancelled", "Fully Filled", "New", "Working"];
  return randomItem(statuses);
}

export function randomFlag() {
  const countries = ["at", "be", "br", "cn", "dk", "fr", "de", "in"];
  return randomItem(countries);
}

export function randomSide() {
  const sides = ["buy", "sell"];
  return randomItem(sides);
}

export function randomInt(min: number, max: number): number {
  return Math.min(Math.floor(Math.random() * (max - min)) + min, max - 1);
}

export function randomCurrency(): string {
  return randomItem(["$", "£", "\u20AC"]);
}

export function randomDate(start: Date, end: Date) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}
