export const usa_states = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

const usa_capital_cities = {
  Alabama: "Montgomery",
  Alaska: "Juneau",
  Arizona: "Phoenix",
  Arkansas: "Little Rock",
  California: "Sacremento",
  Colorado: "Denver",
  Connecticut: "Hartford",
  Delaware: "Dover",
  Florida: "Tallahassee",
  Georgia: "Atlanta",
  Hawaii: "Honululu",
  Idaho: "Boise",
  Illinois: "Springfield",
  Indiana: "Indianapolis",
  Iowa: "Des Moines",
  Kansas: "Topeka",
  Kentucky: "Frankfort",
  Louisiana: "Baton Rouge",
  Maine: "Augusta",
  Maryland: "Annapolis",
  Massachusetts: "Boston",
  Michigan: "Lansing",
  Minnesota: "Saint Paul",
  Mississippi: "Jackson",
  Missouri: "Jefferson City",
  Montana: "Helena",
  Nebraska: "Lincoln",
  Nevada: "Carson City",
  "New Hampshire": "Concord",
  "New Jersey": "Trenton",
  "New Mexico": "Santa Fe",
  "New York": "Albany",
  "North Carolina": "Raleigh",
  "North Dakota": "Bismarck",
  Ohio: "Columbus",
  Oklahoma: "Oklahoma City",
  Oregon: "Salem",
  Pennsylvania: "Harrisburg",
  "Rhode Island": "Providence",
  "South Carolina": "Columbia",
  "South Dakota": "Pierre",
  Tennessee: "Nashville",
  Texas: "Austin",
  Utah: "Salt Lake City",
  Vermont: "Montpelier",
  Virginia: "Richmond",
  Washington: "Olympia",
  "West Virginia": "Charleston",
  Wisconsin: "Madison",
  Wyoming: "Cheyenne",
};

const usa_cities = {
  Alabama: ["Birmingham", "Dothan", "Huntsville", "Mobile", "Montgomery"],
  Alaska: [
    "Anchorage",
    "Juneau",
    "Nightmute",
    "Sitka",
    "Unalaska",
    "Valdez",
    "Wrangell",
  ],
  Arizona: [
    "Buckeye",
    "Case Grande",
    "Eloy",
    "Tuscson",
    "Goodyear",
    "Marana",
    "Mesa",
    "Peoria",
    "Phoenix",
    "Scottsdale",
    "Sierra Vista",
    "Surprise",
    "Tucson",
    "Yuma",
  ],
  Arkansas: ["Jonesboro", "Little Rock"],
  California: [
    "Bakersfield",
    "California City",
    "Fresno",
    "Lancaster",
    "Los Angeles",
    "Palm Springs",
    "Palmdale",
    "Riverside",
    "Sacramento",
    "San Diego",
    "San Jose",
  ],
};

const getCities = (state) => {
  if (usa_cities[state]) {
    return usa_cities[state].map((city) => ({
      label: city,
    }));
  } else {
    return [];
  }
};

export const usa_states_cities = usa_states.map((state) => ({
  label: state,
  childNodes: [
    { label: usa_capital_cities[state], capital: true },
    ...getCities(state),
  ],
}));

const bySelfOrLabel = (a, b) => {
  const a1 = a?.label ?? a;
  const b1 = b?.label ?? b;

  return a1 === b1 ? 0 : a1 > b1 ? 1 : -1;
};

export const groupByInitialLetter = (list, groupMode = "headers-only") => {
  const sortedList = list.slice().sort(bySelfOrLabel);
  const result = [];
  const header = true;
  let char;
  let items = result;

  for (let item of sortedList) {
    const label = item?.label ?? item;
    if (char !== label[0]) {
      if (groupMode === "headers-only") {
        items.push({ label: label[0], header });
      } else {
        result.push({
          label: label[0],
          childNodes: (items = []),
        });
      }
      char = label[0];
    }
    items.push(item);
  }

  return result;
};

export const random_1000 = new Array(1000)
  .fill(0)
  .map((_, i) => `Item ${i + 1}`);
