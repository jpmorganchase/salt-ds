export function randomString(length: number = 20) {
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

export function randomAmount() {
  return Math.round(Math.random() * 10000000) * 0.01;
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
