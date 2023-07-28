const dataGridExampleData = [
  {
    name: "Alabama",
    code: "AL",
    capital: "Montgomery",
    rating: 10,
    population: 8446790,
    date: "29/07/2004"
  },
  {
    name: "Alaska",
    code: "AK",
    capital: "Juneau",
    rating: 20,
    population: 5492139,
    date: "20/05/2009"
  },
  {
    name: "Arizona",
    code: "AZ",
    capital: "Phoenix",
    rating: 30,
    population: 806007,
    date: "23/02/2020"
  },
  {
    name: "Arkansas",
    code: "AR",
    capital: "Little Rock",
    rating: 40,
    population: 59453,
    date: "19/02/1999"
  },
  {
    name: "California",
    code: "CA",
    capital: "Sacramento",
    rating: 10,
    population: 8319396,
    date: "29/04/1967"
  },
  {
    name: "Colorado",
    code: "CO",
    capital: "Denver",
    rating: 10,
    population: 8822592,
    date: "19/02/1944"
  },
  {
    name: "Connecticut",
    code: "CT",
    capital: "Hartford",
    rating: 10,
    population: 2465263,
    date: "30/03/2015"
  },
  {
    name: "Delaware",
    code: "DE",
    capital: "Dover",
    rating: 10,
    population: 3075357,
    date: "04/03/1949"
  },
  {
    name: "Florida",
    code: "FL",
    capital: "Tallahassee",
    rating: 10,
    population: 7597316,
    date: "03/10/2005"
  },
  {
    name: "Georgia",
    code: "GA",
    capital: "Atlanta",
    rating: 10,
    population: 7271180,
    date: "16/02/1998"
  },
  {
    name: "Hawaii",
    code: "HI",
    capital: "Honolulu",
    rating: 10,
    population: 8534120,
    date: "17/02/2005"
  },
  {
    name: "Idaho",
    code: "ID",
    capital: "Boise",
    rating: 10,
    population: 5806269,
    date: "19/02/2007"
  },
  {
    name: "Illinois",
    code: "IL",
    capital: "Springfield",
    rating: 10,
    population: 525951,
    date: "08/11/2022"
  },
  {
    name: "Indiana",
    code: "IN",
    capital: "Indianapolis",
    rating: 10,
    population: 5220228,
    date: "19/02/1920"
  },
  {
    name: "Iowa",
    code: "IA",
    capital: "Des Moines",
    rating: 10,
    population: 333600,
    date: "31/05/2020"
  },
  {
    name: "Kansas",
    code: "KS",
    capital: "Topeka",
    rating: 10,
    population: 170082,
    date: "28/02/1999"
  },
  {
    name: "Kentucky",
    code: "KY",
    capital: "Frankfort",
    rating: 10,
    population: 1359657,
    date: "19/02/1920"
  },
  {
    name: "Louisiana",
    code: "LA",
    capital: "Baton Rouge",
    rating: 10,
    population: 9267793,
    date: "17/02/1970"
  },
  {
    name: "Maine",
    code: "ME",
    capital: "Augusta",
    rating: 10,
    population: 7366792,
    date: "13/02/2000"
  },
  {
    name: "Maryland",
    code: "MD",
    capital: "Annapolis",
    rating: 10,
    population: 2474500,
    date: "18/11/1902"
  },
  {
    name: "Massachusetts",
    code: "MA",
    capital: "Boston",
    rating: 10,
    population: 7858200,
    date: "19/02/1902"
  },
  {
    name: "Michigan",
    code: "MI",
    capital: "Lansing",
    rating: 10,
    population: 4036589,
    date: "19/02/2002"
  },
  {
    name: "Minnesota",
    code: "MN",
    capital: "St. Paul",
    rating: 10,
    population: 490080,
    date: "19/02/1920"
  },
  {
    name: "Mississippi",
    code: "MS",
    capital: "Jackson",
    rating: 10,
    population: 2021576,
    date: "19/02/1920"
  },
  {
    name: "Missouri",
    code: "MO",
    capital: "Jefferson City",
    rating: 10,
    population: 3511147,
    date: "19/02/1920"
  },
  {
    name: "Montana",
    code: "MT",
    capital: "Helena",
    rating: 10,
    population: 2856628,
    date: "19/05/0520"
  },
  {
    name: "Nebraska",
    code: "NE",
    capital: "Lincoln",
    rating: 10,
    population: 9584904,
    date: "05/02/0520"
  },
  {
    name: "Nevada",
    code: "NV",
    capital: "Carson City",
    rating: 10,
    population: 489695,
    date: "05/02/2002"
  },
  {
    name: "New Hampshire",
    code: "NH",
    capital: "Concord",
    rating: 10,
    population: 8819049,
    date: "19/02/2002"
  },
  {
    name: "New Jersey",
    code: "NJ",
    capital: "Trenton",
    rating: 10,
    population: 2500770,
    date: "19/02/2002"
  },
  {
    name: "New Mexico",
    code: "NM",
    capital: "Santa Fe",
    rating: 10,
    population: 536205,
    date: "19/02/2002"
  },
  {
    name: "New York",
    code: "NY",
    capital: "Albany",
    rating: 10,
    population: 5248173,
    date: "19/02/1920"
  },
  {
    name: "North Carolina",
    code: "NC",
    capital: "Raleigh",
    rating: 10,
    population: 1452619,
    date: "10/02/1020"
  },
  {
    name: "North Dakota",
    code: "ND",
    capital: "Bismarck",
    rating: 10,
    population: 8890392,
    date: "19/02/1920"
  },
  {
    name: "Ohio",
    code: "OH",
    capital: "Columbus",
    rating: 10,
    population: 5968829,
    date: "19/02/1920"
  },
  {
    name: "Oklahoma",
    code: "OK",
    capital: "Oklahoma City",
    rating: 10,
    population: 9044655,
    date: "21/02/1950"
  },
  {
    name: "Oregon",
    code: "OR",
    capital: "Salem",
    rating: 10,
    population: 8054969,
    date: "12/10/1920"
  },
  {
    name: "Pennsylvania",
    code: "PA",
    capital: "Harrisburg",
    rating: 10,
    population: 1359410,
    date: "19/02/1920"
  },
  {
    name: "Rhode Island",
    code: "RI",
    capital: "Providence",
    rating: 10,
    population: 4473590,
    date: "19/02/1920"
  },
  {
    name: "South Carolina",
    code: "SC",
    capital: "Columbia",
    rating: 10,
    population: 6527907,
    date: "19/02/1920"
  },
  {
    name: "South Dakota",
    code: "SD",
    capital: "Pierre",
    rating: 10,
    population: 3152416,
    date: "19/02/1920"
  },
  {
    name: "Tennessee",
    code: "TN",
    capital: "Nashville",
    rating: 10,
    population: 9717114,
    date: "19/02/1920"
  },
  {
    name: "Texas",
    code: "TX",
    capital: "Austin",
    rating: 10,
    population: 6552290,
    date: "19/02/1920"
  },
  {
    name: "Utah",
    code: "UT",
    capital: "Salt Lake City",
    rating: 10,
    population: 2815416,
    date: "19/02/1920"
  },
  {
    name: "Vermont",
    code: "VT",
    capital: "Montpelier",
    rating: 10,
    population: 2845360,
    date: "19/02/1920"
  },
  {
    name: "Virginia",
    code: "VA",
    capital: "Richmond",
    rating: 10,
    population: 4919143,
    date: "20/02/1920"
  },
  {
    name: "Washington",
    code: "WA",
    capital: "Olympia",
    rating: 10,
    population: 4614717,
    date: "22/02/2009"
  },
  {
    name: "West Virginia",
    code: "WV",
    capital: "Charleston",
    rating: 10,
    population: 6413104,
    date: "19/11/2002"
  },
  {
    name: "Wisconsin",
    code: "WI",
    capital: "Madison",
    rating: 10,
    population: 3934168,
    date: "01/08/2005"
  },
  {
    name: "Wyoming",
    code: "WY",
    capital: "Cheyenne",
    rating: 10,
    population: 901078,
    date: "01/01/2000"
  },
];

export default dataGridExampleData;
