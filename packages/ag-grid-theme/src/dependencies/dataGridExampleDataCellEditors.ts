export const languages = [
  "English",
  "Spanish",
  "French",
  "Portuguese",
  "(other)",
] as const;
export const sentences = [
  "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas porttitor congue massa.",
  "Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna.",
  "Nunc viverra imperdiet enim. Fusce est. Vivamus a tellus.",
  "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.",
  "Proin pharetra nonummy pede. Mauris et orci. Aenean nec lorem.",
  "In porttitor. Donec laoreet nonummy augue.",
  "Suspendisse dui purus, scelerisque at, vulputate vitae, pretium mattis, nunc.",
  "Mauris eget neque at sem venenatis eleifend. Ut nonummy. Fusce aliquet pede non pede.",
  "Suspendisse dapibus lorem pellentesque magna. Integer nulla.",
  "Donec blandit feugiat ligula. Donec hendrerit, felis et imperdiet euismod, purus ipsum pretium metus, in lacinia nulla nisl eget sapien.",
  "Donec ut est in lectus consequat consequat. Etiam eget dui. Aliquam erat volutpat.",
];
export const shortColorData = [
  "Baby blue",
  "Black",
  "Blue",
  "Brown",
  "Green",
  "Orange",
  "Pink",
  "Purple",
  "Red",
  "White",
  "Yellow",
];

export const currencyList = [
  "USD",
  "EUR",
  "JPY",
  "GBP",
  "CHF",
  "CAD",
  "AUD",
  "NZD",
  "ZAR",
];

export const dataGridExampleDataCellEditors = [
  {
    checked: false,
    name: currencyList[0],
    color: shortColorData[0],
    lang: languages[0],
    sentence: sentences[0],
    count: 10,
    date: "20/05/2009",
  },
  {
    checked: false,
    name: currencyList[1],
    color: shortColorData[1],
    lang: languages[1],
    sentence: sentences[1],
    count: 50,
    date: "20/05/2009",
  },
  {
    checked: true,
    name: currencyList[2],
    color: shortColorData[2],
    lang: languages[2],
    sentence: sentences[2],
    count: 80,
    date: "20/05/2009",
  },
  {
    checked: false,
    name: currencyList[3],
    color: shortColorData[3],
    lang: languages[3],
    sentence: sentences[3],
    count: 55,
    date: "20/05/2009",
  },
  {
    checked: false,
    name: currencyList[4],
    color: shortColorData[4],
    lang: languages[4],
    sentence: sentences[4],
    count: 79,
    date: "20/05/2009",
  },
] as const;
