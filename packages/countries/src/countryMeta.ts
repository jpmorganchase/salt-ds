export const countryCodes = [
  "AD",
  "AE",
  "AF",
  "AG",
  "AI",
  "AL",
  "AM",
  "AO",
  "AQ",
  "AR",
  "AS",
  "AT",
  "AU",
  "AW",
  "AX",
  "AZ",
  "BA",
  "BB",
  "BD",
  "BE",
  "BF",
  "BG",
  "BH",
  "BI",
  "BJ",
  "BL",
  "BM",
  "BN",
  "BO",
  "BQ",
  "BR",
  "BS",
  "BT",
  "BV",
  "BW",
  "BY",
  "BZ",
  "CA",
  "CC",
  "CD",
  "CF",
  "CG",
  "CH",
  "CI",
  "CK",
  "CL",
  "CM",
  "CN",
  "CO",
  "CR",
  "CU",
  "CV",
  "CW",
  "CX",
  "CY",
  "CZ",
  "DE",
  "DJ",
  "DK",
  "DM",
  "DO",
  "DZ",
  "EC",
  "EE",
  "EG",
  "EH",
  "ER",
  "ES",
  "ET",
  "EU",
  "FI",
  "FJ",
  "FK",
  "FM",
  "FO",
  "FR",
  "GA",
  "GB",
  "GB-ENG",
  "GB-NIR",
  "GB-SCT",
  "GB-WLS",
  "GD",
  "GE",
  "GF",
  "GG",
  "GH",
  "GI",
  "GL",
  "GM",
  "GN",
  "GP",
  "GQ",
  "GR",
  "GS",
  "GT",
  "GU",
  "GW",
  "GY",
  "HK",
  "HM",
  "HN",
  "HR",
  "HT",
  "HU",
  "ID",
  "IE",
  "IL",
  "IM",
  "IN",
  "IO",
  "IQ",
  "IR",
  "IS",
  "IT",
  "JE",
  "JM",
  "JO",
  "JP",
  "KE",
  "KG",
  "KH",
  "KI",
  "KM",
  "KN",
  "KP",
  "KR",
  "KW",
  "KY",
  "KZ",
  "LA",
  "LB",
  "LC",
  "LI",
  "LK",
  "LR",
  "LS",
  "LT",
  "LU",
  "LV",
  "LY",
  "MA",
  "MC",
  "MD",
  "ME",
  "MF",
  "MG",
  "MH",
  "MK",
  "ML",
  "MM",
  "MN",
  "MO",
  "MP",
  "MQ",
  "MR",
  "MS",
  "MT",
  "MU",
  "MV",
  "MW",
  "MX",
  "MY",
  "MZ",
  "NA",
  "NC",
  "NE",
  "NF",
  "NG",
  "NI",
  "NL",
  "NO",
  "NP",
  "NR",
  "NU",
  "NZ",
  "OM",
  "PA",
  "PE",
  "PF",
  "PG",
  "PH",
  "PK",
  "PL",
  "PM",
  "PN",
  "PR",
  "PS",
  "PT",
  "PW",
  "PY",
  "QA",
  "RE",
  "RO",
  "RS",
  "RU",
  "RW",
  "SA",
  "SB",
  "SC",
  "SD",
  "SE",
  "SG",
  "SH",
  "SI",
  "SJ",
  "SK",
  "SL",
  "SM",
  "SN",
  "SO",
  "SR",
  "SS",
  "ST",
  "SV",
  "SX",
  "SY",
  "SZ",
  "TC",
  "TD",
  "TF",
  "TG",
  "TH",
  "TJ",
  "TK",
  "TL",
  "TM",
  "TN",
  "TO",
  "TR",
  "TT",
  "TV",
  "TW",
  "TZ",
  "UA",
  "UG",
  "UM",
  "UN",
  "US",
  "UY",
  "UZ",
  "VA",
  "VC",
  "VE",
  "VG",
  "VI",
  "VN",
  "VU",
  "WF",
  "WS",
  "XK",
  "YE",
  "YT",
  "ZA",
  "ZM",
  "ZW"
] as const;

export type CountryMeta = {
  countryCode: string;
  countryName: string;
  countryNameSanitized: string;
  componentName: string;
  textName: string;
  countryFileName: string;
};

export type CountryCode = typeof countryCodes[number];

export type CountriesMeta = Record<CountryCode, CountryMeta>;

export const countryMeta: CountriesMeta = {
  AD: {
    countryCode: "AD",
    countryName: "Andorra",
    countryNameSanitized: "Andorra",
    componentName: "Andorra",
    textName: "Andorra",
    countryFileName: "Andorra.tsx"
  },
  AE: {
    countryCode: "AE",
    countryName: "United Arab Emirates (the)",
    countryNameSanitized: "United Arab Emirates the",
    componentName: "UnitedArabEmiratesThe",
    textName: "United Arab Emirates (the)",
    countryFileName: "UnitedArabEmiratesThe.tsx"
  },
  AF: {
    countryCode: "AF",
    countryName: "Afganistan",
    countryNameSanitized: "Afganistan",
    componentName: "Afganistan",
    textName: "Afganistan",
    countryFileName: "Afganistan.tsx"
  },
  AG: {
    countryCode: "AG",
    countryName: "Antigua and Barbuda",
    countryNameSanitized: "Antigua and Barbuda",
    componentName: "AntiguaAndBarbuda",
    textName: "Antigua and Barbuda",
    countryFileName: "AntiguaAndBarbuda.tsx"
  },
  AI: {
    countryCode: "AI",
    countryName: "Anguilla",
    countryNameSanitized: "Anguilla",
    componentName: "Anguilla",
    textName: "Anguilla",
    countryFileName: "Anguilla.tsx"
  },
  AL: {
    countryCode: "AL",
    countryName: "Albania",
    countryNameSanitized: "Albania",
    componentName: "Albania",
    textName: "Albania",
    countryFileName: "Albania.tsx"
  },
  AM: {
    countryCode: "AM",
    countryName: "Armenia",
    countryNameSanitized: "Armenia",
    componentName: "Armenia",
    textName: "Armenia",
    countryFileName: "Armenia.tsx"
  },
  AO: {
    countryCode: "AO",
    countryName: "Angola",
    countryNameSanitized: "Angola",
    componentName: "Angola",
    textName: "Angola",
    countryFileName: "Angola.tsx"
  },
  AQ: {
    countryCode: "AQ",
    countryName: "Antarctica",
    countryNameSanitized: "Antarctica",
    componentName: "Antarctica",
    textName: "Antarctica",
    countryFileName: "Antarctica.tsx"
  },
  AR: {
    countryCode: "AR",
    countryName: "Argentina",
    countryNameSanitized: "Argentina",
    componentName: "Argentina",
    textName: "Argentina",
    countryFileName: "Argentina.tsx"
  },
  AS: {
    countryCode: "AS",
    countryName: "American Samoa",
    countryNameSanitized: "American Samoa",
    componentName: "AmericanSamoa",
    textName: "American Samoa",
    countryFileName: "AmericanSamoa.tsx"
  },
  AT: {
    countryCode: "AT",
    countryName: "Austria",
    countryNameSanitized: "Austria",
    componentName: "Austria",
    textName: "Austria",
    countryFileName: "Austria.tsx"
  },
  AU: {
    countryCode: "AU",
    countryName: "Australia",
    countryNameSanitized: "Australia",
    componentName: "Australia",
    textName: "Australia",
    countryFileName: "Australia.tsx"
  },
  AW: {
    countryCode: "AW",
    countryName: "Aruba",
    countryNameSanitized: "Aruba",
    componentName: "Aruba",
    textName: "Aruba",
    countryFileName: "Aruba.tsx"
  },
  AX: {
    countryCode: "AX",
    countryName: "Åland Islands",
    countryNameSanitized: "Aland Islands",
    componentName: "AlandIslands",
    textName: "Åland Islands",
    countryFileName: "AlandIslands.tsx"
  },
  AZ: {
    countryCode: "AZ",
    countryName: "Azerbaijan",
    countryNameSanitized: "Azerbaijan",
    componentName: "Azerbaijan",
    textName: "Azerbaijan",
    countryFileName: "Azerbaijan.tsx"
  },
  BA: {
    countryCode: "BA",
    countryName: "Bosnia and Herzegovina",
    countryNameSanitized: "Bosnia and Herzegovina",
    componentName: "BosniaAndHerzegovina",
    textName: "Bosnia and Herzegovina",
    countryFileName: "BosniaAndHerzegovina.tsx"
  },
  BB: {
    countryCode: "BB",
    countryName: "Barbados",
    countryNameSanitized: "Barbados",
    componentName: "Barbados",
    textName: "Barbados",
    countryFileName: "Barbados.tsx"
  },
  BD: {
    countryCode: "BD",
    countryName: "Bangladesh",
    countryNameSanitized: "Bangladesh",
    componentName: "Bangladesh",
    textName: "Bangladesh",
    countryFileName: "Bangladesh.tsx"
  },
  BE: {
    countryCode: "BE",
    countryName: "Belgium",
    countryNameSanitized: "Belgium",
    componentName: "Belgium",
    textName: "Belgium",
    countryFileName: "Belgium.tsx"
  },
  BF: {
    countryCode: "BF",
    countryName: "Burkina Faso",
    countryNameSanitized: "Burkina Faso",
    componentName: "BurkinaFaso",
    textName: "Burkina Faso",
    countryFileName: "BurkinaFaso.tsx"
  },
  BG: {
    countryCode: "BG",
    countryName: "Bulgaria",
    countryNameSanitized: "Bulgaria",
    componentName: "Bulgaria",
    textName: "Bulgaria",
    countryFileName: "Bulgaria.tsx"
  },
  BH: {
    countryCode: "BH",
    countryName: "Bahrain",
    countryNameSanitized: "Bahrain",
    componentName: "Bahrain",
    textName: "Bahrain",
    countryFileName: "Bahrain.tsx"
  },
  BI: {
    countryCode: "BI",
    countryName: "Burundi",
    countryNameSanitized: "Burundi",
    componentName: "Burundi",
    textName: "Burundi",
    countryFileName: "Burundi.tsx"
  },
  BJ: {
    countryCode: "BJ",
    countryName: "Benin",
    countryNameSanitized: "Benin",
    componentName: "Benin",
    textName: "Benin",
    countryFileName: "Benin.tsx"
  },
  BL: {
    countryCode: "BL",
    countryName: "Saint Barthélemy",
    countryNameSanitized: "Saint Barthelemy",
    componentName: "SaintBarthelemy",
    textName: "Saint Barthélemy",
    countryFileName: "SaintBarthelemy.tsx"
  },
  BM: {
    countryCode: "BM",
    countryName: "Bermuda",
    countryNameSanitized: "Bermuda",
    componentName: "Bermuda",
    textName: "Bermuda",
    countryFileName: "Bermuda.tsx"
  },
  BN: {
    countryCode: "BN",
    countryName: "Brunei Darussalam",
    countryNameSanitized: "Brunei Darussalam",
    componentName: "BruneiDarussalam",
    textName: "Brunei Darussalam",
    countryFileName: "BruneiDarussalam.tsx"
  },
  BO: {
    countryCode: "BO",
    countryName: "Bolivia (Plurinational State of)",
    countryNameSanitized: "Bolivia Plurinational State of",
    componentName: "BoliviaPlurinationalStateOf",
    textName: "Bolivia (Plurinational State of)",
    countryFileName: "BoliviaPlurinationalStateOf.tsx"
  },
  BQ: {
    countryCode: "BQ",
    countryName: "Bonaire Sint Eustatius and Saba",
    countryNameSanitized: "Bonaire Sint Eustatius and Saba",
    componentName: "BonaireSintEustatiusAndSaba",
    textName: "Bonaire Sint Eustatius and Saba",
    countryFileName: "BonaireSintEustatiusAndSaba.tsx"
  },
  BR: {
    countryCode: "BR",
    countryName: "Brazil",
    countryNameSanitized: "Brazil",
    componentName: "Brazil",
    textName: "Brazil",
    countryFileName: "Brazil.tsx"
  },
  BS: {
    countryCode: "BS",
    countryName: "Bahamas (the)",
    countryNameSanitized: "Bahamas the",
    componentName: "BahamasThe",
    textName: "Bahamas (the)",
    countryFileName: "BahamasThe.tsx"
  },
  BT: {
    countryCode: "BT",
    countryName: "Bhutan",
    countryNameSanitized: "Bhutan",
    componentName: "Bhutan",
    textName: "Bhutan",
    countryFileName: "Bhutan.tsx"
  },
  BV: {
    countryCode: "BV",
    countryName: "Bouvet Island",
    countryNameSanitized: "Bouvet Island",
    componentName: "BouvetIsland",
    textName: "Bouvet Island",
    countryFileName: "BouvetIsland.tsx"
  },
  BW: {
    countryCode: "BW",
    countryName: "Botswana",
    countryNameSanitized: "Botswana",
    componentName: "Botswana",
    textName: "Botswana",
    countryFileName: "Botswana.tsx"
  },
  BY: {
    countryCode: "BY",
    countryName: "Belarus",
    countryNameSanitized: "Belarus",
    componentName: "Belarus",
    textName: "Belarus",
    countryFileName: "Belarus.tsx"
  },
  BZ: {
    countryCode: "BZ",
    countryName: "Belize",
    countryNameSanitized: "Belize",
    componentName: "Belize",
    textName: "Belize",
    countryFileName: "Belize.tsx"
  },
  CA: {
    countryCode: "CA",
    countryName: "Canada",
    countryNameSanitized: "Canada",
    componentName: "Canada",
    textName: "Canada",
    countryFileName: "Canada.tsx"
  },
  CC: {
    countryCode: "CC",
    countryName: "Cocos (Keeling) Islands (the)",
    countryNameSanitized: "Cocos Keeling Islands the",
    componentName: "CocosKeelingIslandsThe",
    textName: "Cocos (Keeling) Islands (the)",
    countryFileName: "CocosKeelingIslandsThe.tsx"
  },
  CD: {
    countryCode: "CD",
    countryName: "Congo (the Democratic Republic of the)",
    countryNameSanitized: "Congo the Democratic Republic of the",
    componentName: "CongoTheDemocraticRepublicOfThe",
    textName: "Congo (the Democratic Republic of the)",
    countryFileName: "CongoTheDemocraticRepublicOfThe.tsx"
  },
  CF: {
    countryCode: "CF",
    countryName: "Central African Republic (the)",
    countryNameSanitized: "Central African Republic the",
    componentName: "CentralAfricanRepublicThe",
    textName: "Central African Republic (the)",
    countryFileName: "CentralAfricanRepublicThe.tsx"
  },
  CG: {
    countryCode: "CG",
    countryName: "Congo (the)",
    countryNameSanitized: "Congo the",
    componentName: "CongoThe",
    textName: "Congo (the)",
    countryFileName: "CongoThe.tsx"
  },
  CH: {
    countryCode: "CH",
    countryName: "Switzerland",
    countryNameSanitized: "Switzerland",
    componentName: "Switzerland",
    textName: "Switzerland",
    countryFileName: "Switzerland.tsx"
  },
  CI: {
    countryCode: "CI",
    countryName: "Côte d'Ivoire",
    countryNameSanitized: "Cote dIvoire",
    componentName: "CoteDivoire",
    textName: "Côte d'Ivoire",
    countryFileName: "CoteDivoire.tsx"
  },
  CK: {
    countryCode: "CK",
    countryName: "Cook Islands (the)",
    countryNameSanitized: "Cook Islands the",
    componentName: "CookIslandsThe",
    textName: "Cook Islands (the)",
    countryFileName: "CookIslandsThe.tsx"
  },
  CL: {
    countryCode: "CL",
    countryName: "Chile",
    countryNameSanitized: "Chile",
    componentName: "Chile",
    textName: "Chile",
    countryFileName: "Chile.tsx"
  },
  CM: {
    countryCode: "CM",
    countryName: "Cameroon",
    countryNameSanitized: "Cameroon",
    componentName: "Cameroon",
    textName: "Cameroon",
    countryFileName: "Cameroon.tsx"
  },
  CN: {
    countryCode: "CN",
    countryName: "China",
    countryNameSanitized: "China",
    componentName: "China",
    textName: "China",
    countryFileName: "China.tsx"
  },
  CO: {
    countryCode: "CO",
    countryName: "Colombia",
    countryNameSanitized: "Colombia",
    componentName: "Colombia",
    textName: "Colombia",
    countryFileName: "Colombia.tsx"
  },
  CR: {
    countryCode: "CR",
    countryName: "Costa Rica",
    countryNameSanitized: "Costa Rica",
    componentName: "CostaRica",
    textName: "Costa Rica",
    countryFileName: "CostaRica.tsx"
  },
  CU: {
    countryCode: "CU",
    countryName: "Cuba",
    countryNameSanitized: "Cuba",
    componentName: "Cuba",
    textName: "Cuba",
    countryFileName: "Cuba.tsx"
  },
  CV: {
    countryCode: "CV",
    countryName: "Cabo Verde",
    countryNameSanitized: "Cabo Verde",
    componentName: "CaboVerde",
    textName: "Cabo Verde",
    countryFileName: "CaboVerde.tsx"
  },
  CW: {
    countryCode: "CW",
    countryName: "Curaçao",
    countryNameSanitized: "Curacao",
    componentName: "Curacao",
    textName: "Curaçao",
    countryFileName: "Curacao.tsx"
  },
  CX: {
    countryCode: "CX",
    countryName: "Christmas Island",
    countryNameSanitized: "Christmas Island",
    componentName: "ChristmasIsland",
    textName: "Christmas Island",
    countryFileName: "ChristmasIsland.tsx"
  },
  CY: {
    countryCode: "CY",
    countryName: "Cyprus",
    countryNameSanitized: "Cyprus",
    componentName: "Cyprus",
    textName: "Cyprus",
    countryFileName: "Cyprus.tsx"
  },
  CZ: {
    countryCode: "CZ",
    countryName: "Czechia",
    countryNameSanitized: "Czechia",
    componentName: "Czechia",
    textName: "Czechia",
    countryFileName: "Czechia.tsx"
  },
  DE: {
    countryCode: "DE",
    countryName: "Germany",
    countryNameSanitized: "Germany",
    componentName: "Germany",
    textName: "Germany",
    countryFileName: "Germany.tsx"
  },
  DJ: {
    countryCode: "DJ",
    countryName: "Djibouti",
    countryNameSanitized: "Djibouti",
    componentName: "Djibouti",
    textName: "Djibouti",
    countryFileName: "Djibouti.tsx"
  },
  DK: {
    countryCode: "DK",
    countryName: "Denmark",
    countryNameSanitized: "Denmark",
    componentName: "Denmark",
    textName: "Denmark",
    countryFileName: "Denmark.tsx"
  },
  DM: {
    countryCode: "DM",
    countryName: "Dominica",
    countryNameSanitized: "Dominica",
    componentName: "Dominica",
    textName: "Dominica",
    countryFileName: "Dominica.tsx"
  },
  DO: {
    countryCode: "DO",
    countryName: "Dominican Republic (the)",
    countryNameSanitized: "Dominican Republic the",
    componentName: "DominicanRepublicThe",
    textName: "Dominican Republic (the)",
    countryFileName: "DominicanRepublicThe.tsx"
  },
  DZ: {
    countryCode: "DZ",
    countryName: "Algeria",
    countryNameSanitized: "Algeria",
    componentName: "Algeria",
    textName: "Algeria",
    countryFileName: "Algeria.tsx"
  },
  EC: {
    countryCode: "EC",
    countryName: "Ecuador",
    countryNameSanitized: "Ecuador",
    componentName: "Ecuador",
    textName: "Ecuador",
    countryFileName: "Ecuador.tsx"
  },
  EE: {
    countryCode: "EE",
    countryName: "Estonia",
    countryNameSanitized: "Estonia",
    componentName: "Estonia",
    textName: "Estonia",
    countryFileName: "Estonia.tsx"
  },
  EG: {
    countryCode: "EG",
    countryName: "Egypt",
    countryNameSanitized: "Egypt",
    componentName: "Egypt",
    textName: "Egypt",
    countryFileName: "Egypt.tsx"
  },
  EH: {
    countryCode: "EH",
    countryName: "Western Sahara",
    countryNameSanitized: "Western Sahara",
    componentName: "WesternSahara",
    textName: "Western Sahara",
    countryFileName: "WesternSahara.tsx"
  },
  ER: {
    countryCode: "ER",
    countryName: "Eritrea",
    countryNameSanitized: "Eritrea",
    componentName: "Eritrea",
    textName: "Eritrea",
    countryFileName: "Eritrea.tsx"
  },
  ES: {
    countryCode: "ES",
    countryName: "Spain",
    countryNameSanitized: "Spain",
    componentName: "Spain",
    textName: "Spain",
    countryFileName: "Spain.tsx"
  },
  ET: {
    countryCode: "ET",
    countryName: "Ethiopia",
    countryNameSanitized: "Ethiopia",
    componentName: "Ethiopia",
    textName: "Ethiopia",
    countryFileName: "Ethiopia.tsx"
  },
  EU: {
    countryCode: "EU",
    countryName: "European Union",
    countryNameSanitized: "European Union",
    componentName: "EuropeanUnion",
    textName: "European Union",
    countryFileName: "EuropeanUnion.tsx"
  },
  FI: {
    countryCode: "FI",
    countryName: "Finland",
    countryNameSanitized: "Finland",
    componentName: "Finland",
    textName: "Finland",
    countryFileName: "Finland.tsx"
  },
  FJ: {
    countryCode: "FJ",
    countryName: "Fiji",
    countryNameSanitized: "Fiji",
    componentName: "Fiji",
    textName: "Fiji",
    countryFileName: "Fiji.tsx"
  },
  FK: {
    countryCode: "FK",
    countryName: "Falkland Islands (the) [Malvinas]",
    countryNameSanitized: "Falkland Islands the Malvinas",
    componentName: "FalklandIslandsTheMalvinas",
    textName: "Falkland Islands (the) [Malvinas]",
    countryFileName: "FalklandIslandsTheMalvinas.tsx"
  },
  FM: {
    countryCode: "FM",
    countryName: "Micronesia (Federated States of)",
    countryNameSanitized: "Micronesia Federated States of",
    componentName: "MicronesiaFederatedStatesOf",
    textName: "Micronesia (Federated States of)",
    countryFileName: "MicronesiaFederatedStatesOf.tsx"
  },
  FO: {
    countryCode: "FO",
    countryName: "Faroe Islands (the)",
    countryNameSanitized: "Faroe Islands the",
    componentName: "FaroeIslandsThe",
    textName: "Faroe Islands (the)",
    countryFileName: "FaroeIslandsThe.tsx"
  },
  FR: {
    countryCode: "FR",
    countryName: "France",
    countryNameSanitized: "France",
    componentName: "France",
    textName: "France",
    countryFileName: "France.tsx"
  },
  GA: {
    countryCode: "GA",
    countryName: "Gabon",
    countryNameSanitized: "Gabon",
    componentName: "Gabon",
    textName: "Gabon",
    countryFileName: "Gabon.tsx"
  },
  GB: {
    countryCode: "GB",
    countryName: "Great Britain",
    countryNameSanitized: "Great Britain",
    componentName: "GreatBritain",
    textName: "Great Britain",
    countryFileName: "GreatBritain.tsx"
  },
  "GB-ENG": {
    countryCode: "GB-ENG",
    countryName: "England",
    countryNameSanitized: "England",
    componentName: "England",
    textName: "England",
    countryFileName: "England.tsx"
  },
  "GB-NIR": {
    countryCode: "GB-NIR",
    countryName: "Northern Ireland",
    countryNameSanitized: "Northern Ireland",
    componentName: "NorthernIreland",
    textName: "Northern Ireland",
    countryFileName: "NorthernIreland.tsx"
  },
  "GB-SCT": {
    countryCode: "GB-SCT",
    countryName: "Scotland",
    countryNameSanitized: "Scotland",
    componentName: "Scotland",
    textName: "Scotland",
    countryFileName: "Scotland.tsx"
  },
  "GB-WLS": {
    countryCode: "GB-WLS",
    countryName: "Wales",
    countryNameSanitized: "Wales",
    componentName: "Wales",
    textName: "Wales",
    countryFileName: "Wales.tsx"
  },
  GD: {
    countryCode: "GD",
    countryName: "Grenada",
    countryNameSanitized: "Grenada",
    componentName: "Grenada",
    textName: "Grenada",
    countryFileName: "Grenada.tsx"
  },
  GE: {
    countryCode: "GE",
    countryName: "Georgia",
    countryNameSanitized: "Georgia",
    componentName: "Georgia",
    textName: "Georgia",
    countryFileName: "Georgia.tsx"
  },
  GF: {
    countryCode: "GF",
    countryName: "French Guiana",
    countryNameSanitized: "French Guiana",
    componentName: "FrenchGuiana",
    textName: "French Guiana",
    countryFileName: "FrenchGuiana.tsx"
  },
  GG: {
    countryCode: "GG",
    countryName: "Guernsey",
    countryNameSanitized: "Guernsey",
    componentName: "Guernsey",
    textName: "Guernsey",
    countryFileName: "Guernsey.tsx"
  },
  GH: {
    countryCode: "GH",
    countryName: "Ghana",
    countryNameSanitized: "Ghana",
    componentName: "Ghana",
    textName: "Ghana",
    countryFileName: "Ghana.tsx"
  },
  GI: {
    countryCode: "GI",
    countryName: "Gibraltar",
    countryNameSanitized: "Gibraltar",
    componentName: "Gibraltar",
    textName: "Gibraltar",
    countryFileName: "Gibraltar.tsx"
  },
  GL: {
    countryCode: "GL",
    countryName: "Greenland",
    countryNameSanitized: "Greenland",
    componentName: "Greenland",
    textName: "Greenland",
    countryFileName: "Greenland.tsx"
  },
  GM: {
    countryCode: "GM",
    countryName: "Gambia (the)",
    countryNameSanitized: "Gambia the",
    componentName: "GambiaThe",
    textName: "Gambia (the)",
    countryFileName: "GambiaThe.tsx"
  },
  GN: {
    countryCode: "GN",
    countryName: "Guinea",
    countryNameSanitized: "Guinea",
    componentName: "Guinea",
    textName: "Guinea",
    countryFileName: "Guinea.tsx"
  },
  GP: {
    countryCode: "GP",
    countryName: "Guadeloupe",
    countryNameSanitized: "Guadeloupe",
    componentName: "Guadeloupe",
    textName: "Guadeloupe",
    countryFileName: "Guadeloupe.tsx"
  },
  GQ: {
    countryCode: "GQ",
    countryName: "Equatorial Guinea",
    countryNameSanitized: "Equatorial Guinea",
    componentName: "EquatorialGuinea",
    textName: "Equatorial Guinea",
    countryFileName: "EquatorialGuinea.tsx"
  },
  GR: {
    countryCode: "GR",
    countryName: "Greece",
    countryNameSanitized: "Greece",
    componentName: "Greece",
    textName: "Greece",
    countryFileName: "Greece.tsx"
  },
  GS: {
    countryCode: "GS",
    countryName: "South Georgia and the South Sandwich Islands",
    countryNameSanitized: "South Georgia and the South Sandwich Islands",
    componentName: "SouthGeorgiaAndTheSouthSandwichIslands",
    textName: "South Georgia and the South Sandwich Islands",
    countryFileName: "SouthGeorgiaAndTheSouthSandwichIslands.tsx"
  },
  GT: {
    countryCode: "GT",
    countryName: "Guatemala",
    countryNameSanitized: "Guatemala",
    componentName: "Guatemala",
    textName: "Guatemala",
    countryFileName: "Guatemala.tsx"
  },
  GU: {
    countryCode: "GU",
    countryName: "Guam",
    countryNameSanitized: "Guam",
    componentName: "Guam",
    textName: "Guam",
    countryFileName: "Guam.tsx"
  },
  GW: {
    countryCode: "GW",
    countryName: "Guinea-Bissau",
    countryNameSanitized: "GuineaBissau",
    componentName: "Guineabissau",
    textName: "Guinea-Bissau",
    countryFileName: "Guineabissau.tsx"
  },
  GY: {
    countryCode: "GY",
    countryName: "Guyana",
    countryNameSanitized: "Guyana",
    componentName: "Guyana",
    textName: "Guyana",
    countryFileName: "Guyana.tsx"
  },
  HK: {
    countryCode: "HK",
    countryName: "Hong Kong",
    countryNameSanitized: "Hong Kong",
    componentName: "HongKong",
    textName: "Hong Kong",
    countryFileName: "HongKong.tsx"
  },
  HM: {
    countryCode: "HM",
    countryName: "Heard Island and McDonald Islands",
    countryNameSanitized: "Heard Island and McDonald Islands",
    componentName: "HeardIslandAndMcdonaldIslands",
    textName: "Heard Island and McDonald Islands",
    countryFileName: "HeardIslandAndMcdonaldIslands.tsx"
  },
  HN: {
    countryCode: "HN",
    countryName: "Honduras",
    countryNameSanitized: "Honduras",
    componentName: "Honduras",
    textName: "Honduras",
    countryFileName: "Honduras.tsx"
  },
  HR: {
    countryCode: "HR",
    countryName: "Croatia",
    countryNameSanitized: "Croatia",
    componentName: "Croatia",
    textName: "Croatia",
    countryFileName: "Croatia.tsx"
  },
  HT: {
    countryCode: "HT",
    countryName: "Haiti",
    countryNameSanitized: "Haiti",
    componentName: "Haiti",
    textName: "Haiti",
    countryFileName: "Haiti.tsx"
  },
  HU: {
    countryCode: "HU",
    countryName: "Hungary",
    countryNameSanitized: "Hungary",
    componentName: "Hungary",
    textName: "Hungary",
    countryFileName: "Hungary.tsx"
  },
  ID: {
    countryCode: "ID",
    countryName: "Indonisia",
    countryNameSanitized: "Indonisia",
    componentName: "Indonisia",
    textName: "Indonisia",
    countryFileName: "Indonisia.tsx"
  },
  IE: {
    countryCode: "IE",
    countryName: "Ireland",
    countryNameSanitized: "Ireland",
    componentName: "Ireland",
    textName: "Ireland",
    countryFileName: "Ireland.tsx"
  },
  IL: {
    countryCode: "IL",
    countryName: "Israel",
    countryNameSanitized: "Israel",
    componentName: "Israel",
    textName: "Israel",
    countryFileName: "Israel.tsx"
  },
  IM: {
    countryCode: "IM",
    countryName: "Isle of Man",
    countryNameSanitized: "Isle of Man",
    componentName: "IsleOfMan",
    textName: "Isle of Man",
    countryFileName: "IsleOfMan.tsx"
  },
  IN: {
    countryCode: "IN",
    countryName: "India",
    countryNameSanitized: "India",
    componentName: "India",
    textName: "India",
    countryFileName: "India.tsx"
  },
  IO: {
    countryCode: "IO",
    countryName: "British Indian Ocean Territory (the)",
    countryNameSanitized: "British Indian Ocean Territory the",
    componentName: "BritishIndianOceanTerritoryThe",
    textName: "British Indian Ocean Territory (the)",
    countryFileName: "BritishIndianOceanTerritoryThe.tsx"
  },
  IQ: {
    countryCode: "IQ",
    countryName: "Iraq",
    countryNameSanitized: "Iraq",
    componentName: "Iraq",
    textName: "Iraq",
    countryFileName: "Iraq.tsx"
  },
  IR: {
    countryCode: "IR",
    countryName: "Iran (Islamic Republic of)",
    countryNameSanitized: "Iran Islamic Republic of",
    componentName: "IranIslamicRepublicOf",
    textName: "Iran (Islamic Republic of)",
    countryFileName: "IranIslamicRepublicOf.tsx"
  },
  IS: {
    countryCode: "IS",
    countryName: "Iceland",
    countryNameSanitized: "Iceland",
    componentName: "Iceland",
    textName: "Iceland",
    countryFileName: "Iceland.tsx"
  },
  IT: {
    countryCode: "IT",
    countryName: "Italy",
    countryNameSanitized: "Italy",
    componentName: "Italy",
    textName: "Italy",
    countryFileName: "Italy.tsx"
  },
  JE: {
    countryCode: "JE",
    countryName: "Jersey",
    countryNameSanitized: "Jersey",
    componentName: "Jersey",
    textName: "Jersey",
    countryFileName: "Jersey.tsx"
  },
  JM: {
    countryCode: "JM",
    countryName: "Jamaica",
    countryNameSanitized: "Jamaica",
    componentName: "Jamaica",
    textName: "Jamaica",
    countryFileName: "Jamaica.tsx"
  },
  JO: {
    countryCode: "JO",
    countryName: "Jordan",
    countryNameSanitized: "Jordan",
    componentName: "Jordan",
    textName: "Jordan",
    countryFileName: "Jordan.tsx"
  },
  JP: {
    countryCode: "JP",
    countryName: "Japan",
    countryNameSanitized: "Japan",
    componentName: "Japan",
    textName: "Japan",
    countryFileName: "Japan.tsx"
  },
  KE: {
    countryCode: "KE",
    countryName: "Kenya",
    countryNameSanitized: "Kenya",
    componentName: "Kenya",
    textName: "Kenya",
    countryFileName: "Kenya.tsx"
  },
  KG: {
    countryCode: "KG",
    countryName: "Kyrgyzstan",
    countryNameSanitized: "Kyrgyzstan",
    componentName: "Kyrgyzstan",
    textName: "Kyrgyzstan",
    countryFileName: "Kyrgyzstan.tsx"
  },
  KH: {
    countryCode: "KH",
    countryName: "Cambodia",
    countryNameSanitized: "Cambodia",
    componentName: "Cambodia",
    textName: "Cambodia",
    countryFileName: "Cambodia.tsx"
  },
  KI: {
    countryCode: "KI",
    countryName: "Kiribati",
    countryNameSanitized: "Kiribati",
    componentName: "Kiribati",
    textName: "Kiribati",
    countryFileName: "Kiribati.tsx"
  },
  KM: {
    countryCode: "KM",
    countryName: "Comoros (the)",
    countryNameSanitized: "Comoros the",
    componentName: "ComorosThe",
    textName: "Comoros (the)",
    countryFileName: "ComorosThe.tsx"
  },
  KN: {
    countryCode: "KN",
    countryName: "Saint Kitts and Nevis",
    countryNameSanitized: "Saint Kitts and Nevis",
    componentName: "SaintKittsAndNevis",
    textName: "Saint Kitts and Nevis",
    countryFileName: "SaintKittsAndNevis.tsx"
  },
  KP: {
    countryCode: "KP",
    countryName: "Korea (Democratic People's Republic of)",
    countryNameSanitized: "Korea Democratic Peoples Republic of",
    componentName: "KoreaDemocraticPeoplesRepublicOf",
    textName: "Korea (Democratic People's Republic of)",
    countryFileName: "KoreaDemocraticPeoplesRepublicOf.tsx"
  },
  KR: {
    countryCode: "KR",
    countryName: "Korea (Republic of)",
    countryNameSanitized: "Korea Republic of",
    componentName: "KoreaRepublicOf",
    textName: "Korea (Republic of)",
    countryFileName: "KoreaRepublicOf.tsx"
  },
  KW: {
    countryCode: "KW",
    countryName: "Kuwait",
    countryNameSanitized: "Kuwait",
    componentName: "Kuwait",
    textName: "Kuwait",
    countryFileName: "Kuwait.tsx"
  },
  KY: {
    countryCode: "KY",
    countryName: "Cayman Islands (the)",
    countryNameSanitized: "Cayman Islands the",
    componentName: "CaymanIslandsThe",
    textName: "Cayman Islands (the)",
    countryFileName: "CaymanIslandsThe.tsx"
  },
  KZ: {
    countryCode: "KZ",
    countryName: "Kazakhstan",
    countryNameSanitized: "Kazakhstan",
    componentName: "Kazakhstan",
    textName: "Kazakhstan",
    countryFileName: "Kazakhstan.tsx"
  },
  LA: {
    countryCode: "LA",
    countryName: "Lao People's Democratic Republic (the)",
    countryNameSanitized: "Lao Peoples Democratic Republic the",
    componentName: "LaoPeoplesDemocraticRepublicThe",
    textName: "Lao People's Democratic Republic (the)",
    countryFileName: "LaoPeoplesDemocraticRepublicThe.tsx"
  },
  LB: {
    countryCode: "LB",
    countryName: "Lebanon",
    countryNameSanitized: "Lebanon",
    componentName: "Lebanon",
    textName: "Lebanon",
    countryFileName: "Lebanon.tsx"
  },
  LC: {
    countryCode: "LC",
    countryName: "Saint Lucia",
    countryNameSanitized: "Saint Lucia",
    componentName: "SaintLucia",
    textName: "Saint Lucia",
    countryFileName: "SaintLucia.tsx"
  },
  LI: {
    countryCode: "LI",
    countryName: "Liechtenstein",
    countryNameSanitized: "Liechtenstein",
    componentName: "Liechtenstein",
    textName: "Liechtenstein",
    countryFileName: "Liechtenstein.tsx"
  },
  LK: {
    countryCode: "LK",
    countryName: "Sri Lanka",
    countryNameSanitized: "Sri Lanka",
    componentName: "SriLanka",
    textName: "Sri Lanka",
    countryFileName: "SriLanka.tsx"
  },
  LR: {
    countryCode: "LR",
    countryName: "Liberia",
    countryNameSanitized: "Liberia",
    componentName: "Liberia",
    textName: "Liberia",
    countryFileName: "Liberia.tsx"
  },
  LS: {
    countryCode: "LS",
    countryName: "Lesotho",
    countryNameSanitized: "Lesotho",
    componentName: "Lesotho",
    textName: "Lesotho",
    countryFileName: "Lesotho.tsx"
  },
  LT: {
    countryCode: "LT",
    countryName: "Lithuania",
    countryNameSanitized: "Lithuania",
    componentName: "Lithuania",
    textName: "Lithuania",
    countryFileName: "Lithuania.tsx"
  },
  LU: {
    countryCode: "LU",
    countryName: "Luxembourg",
    countryNameSanitized: "Luxembourg",
    componentName: "Luxembourg",
    textName: "Luxembourg",
    countryFileName: "Luxembourg.tsx"
  },
  LV: {
    countryCode: "LV",
    countryName: "Latvia",
    countryNameSanitized: "Latvia",
    componentName: "Latvia",
    textName: "Latvia",
    countryFileName: "Latvia.tsx"
  },
  LY: {
    countryCode: "LY",
    countryName: "Libya",
    countryNameSanitized: "Libya",
    componentName: "Libya",
    textName: "Libya",
    countryFileName: "Libya.tsx"
  },
  MA: {
    countryCode: "MA",
    countryName: "Morocco",
    countryNameSanitized: "Morocco",
    componentName: "Morocco",
    textName: "Morocco",
    countryFileName: "Morocco.tsx"
  },
  MC: {
    countryCode: "MC",
    countryName: "Monaco",
    countryNameSanitized: "Monaco",
    componentName: "Monaco",
    textName: "Monaco",
    countryFileName: "Monaco.tsx"
  },
  MD: {
    countryCode: "MD",
    countryName: "Moldova (the Republic of)",
    countryNameSanitized: "Moldova the Republic of",
    componentName: "MoldovaTheRepublicOf",
    textName: "Moldova (the Republic of)",
    countryFileName: "MoldovaTheRepublicOf.tsx"
  },
  ME: {
    countryCode: "ME",
    countryName: "Montenegro",
    countryNameSanitized: "Montenegro",
    componentName: "Montenegro",
    textName: "Montenegro",
    countryFileName: "Montenegro.tsx"
  },
  MF: {
    countryCode: "MF",
    countryName: "Saint Martin (French part)",
    countryNameSanitized: "Saint Martin French part",
    componentName: "SaintMartinFrenchPart",
    textName: "Saint Martin (French part)",
    countryFileName: "SaintMartinFrenchPart.tsx"
  },
  MG: {
    countryCode: "MG",
    countryName: "Madagascar",
    countryNameSanitized: "Madagascar",
    componentName: "Madagascar",
    textName: "Madagascar",
    countryFileName: "Madagascar.tsx"
  },
  MH: {
    countryCode: "MH",
    countryName: "Marshall Islands (the)",
    countryNameSanitized: "Marshall Islands the",
    componentName: "MarshallIslandsThe",
    textName: "Marshall Islands (the)",
    countryFileName: "MarshallIslandsThe.tsx"
  },
  MK: {
    countryCode: "MK",
    countryName: "North Macedonia",
    countryNameSanitized: "North Macedonia",
    componentName: "NorthMacedonia",
    textName: "North Macedonia",
    countryFileName: "NorthMacedonia.tsx"
  },
  ML: {
    countryCode: "ML",
    countryName: "Mali",
    countryNameSanitized: "Mali",
    componentName: "Mali",
    textName: "Mali",
    countryFileName: "Mali.tsx"
  },
  MM: {
    countryCode: "MM",
    countryName: "Myanmar",
    countryNameSanitized: "Myanmar",
    componentName: "Myanmar",
    textName: "Myanmar",
    countryFileName: "Myanmar.tsx"
  },
  MN: {
    countryCode: "MN",
    countryName: "Mongolia",
    countryNameSanitized: "Mongolia",
    componentName: "Mongolia",
    textName: "Mongolia",
    countryFileName: "Mongolia.tsx"
  },
  MO: {
    countryCode: "MO",
    countryName: "Macao",
    countryNameSanitized: "Macao",
    componentName: "Macao",
    textName: "Macao",
    countryFileName: "Macao.tsx"
  },
  MP: {
    countryCode: "MP",
    countryName: "Northern Mariana Islands (the)",
    countryNameSanitized: "Northern Mariana Islands the",
    componentName: "NorthernMarianaIslandsThe",
    textName: "Northern Mariana Islands (the)",
    countryFileName: "NorthernMarianaIslandsThe.tsx"
  },
  MQ: {
    countryCode: "MQ",
    countryName: "Martinique",
    countryNameSanitized: "Martinique",
    componentName: "Martinique",
    textName: "Martinique",
    countryFileName: "Martinique.tsx"
  },
  MR: {
    countryCode: "MR",
    countryName: "Mauritania",
    countryNameSanitized: "Mauritania",
    componentName: "Mauritania",
    textName: "Mauritania",
    countryFileName: "Mauritania.tsx"
  },
  MS: {
    countryCode: "MS",
    countryName: "Montserrat",
    countryNameSanitized: "Montserrat",
    componentName: "Montserrat",
    textName: "Montserrat",
    countryFileName: "Montserrat.tsx"
  },
  MT: {
    countryCode: "MT",
    countryName: "Malta",
    countryNameSanitized: "Malta",
    componentName: "Malta",
    textName: "Malta",
    countryFileName: "Malta.tsx"
  },
  MU: {
    countryCode: "MU",
    countryName: "Mauritius",
    countryNameSanitized: "Mauritius",
    componentName: "Mauritius",
    textName: "Mauritius",
    countryFileName: "Mauritius.tsx"
  },
  MV: {
    countryCode: "MV",
    countryName: "Maldives",
    countryNameSanitized: "Maldives",
    componentName: "Maldives",
    textName: "Maldives",
    countryFileName: "Maldives.tsx"
  },
  MW: {
    countryCode: "MW",
    countryName: "Malawi",
    countryNameSanitized: "Malawi",
    componentName: "Malawi",
    textName: "Malawi",
    countryFileName: "Malawi.tsx"
  },
  MX: {
    countryCode: "MX",
    countryName: "Mexico",
    countryNameSanitized: "Mexico",
    componentName: "Mexico",
    textName: "Mexico",
    countryFileName: "Mexico.tsx"
  },
  MY: {
    countryCode: "MY",
    countryName: "Malaysia",
    countryNameSanitized: "Malaysia",
    componentName: "Malaysia",
    textName: "Malaysia",
    countryFileName: "Malaysia.tsx"
  },
  MZ: {
    countryCode: "MZ",
    countryName: "Mozambique",
    countryNameSanitized: "Mozambique",
    componentName: "Mozambique",
    textName: "Mozambique",
    countryFileName: "Mozambique.tsx"
  },
  NA: {
    countryCode: "NA",
    countryName: "Namibia",
    countryNameSanitized: "Namibia",
    componentName: "Namibia",
    textName: "Namibia",
    countryFileName: "Namibia.tsx"
  },
  NC: {
    countryCode: "NC",
    countryName: "New Caledonia",
    countryNameSanitized: "New Caledonia",
    componentName: "NewCaledonia",
    textName: "New Caledonia",
    countryFileName: "NewCaledonia.tsx"
  },
  NE: {
    countryCode: "NE",
    countryName: "Niger (the)",
    countryNameSanitized: "Niger the",
    componentName: "NigerThe",
    textName: "Niger (the)",
    countryFileName: "NigerThe.tsx"
  },
  NF: {
    countryCode: "NF",
    countryName: "Norfolk Island",
    countryNameSanitized: "Norfolk Island",
    componentName: "NorfolkIsland",
    textName: "Norfolk Island",
    countryFileName: "NorfolkIsland.tsx"
  },
  NG: {
    countryCode: "NG",
    countryName: "Nigeria",
    countryNameSanitized: "Nigeria",
    componentName: "Nigeria",
    textName: "Nigeria",
    countryFileName: "Nigeria.tsx"
  },
  NI: {
    countryCode: "NI",
    countryName: "Nicaragua",
    countryNameSanitized: "Nicaragua",
    componentName: "Nicaragua",
    textName: "Nicaragua",
    countryFileName: "Nicaragua.tsx"
  },
  NL: {
    countryCode: "NL",
    countryName: "Netherlands (the)",
    countryNameSanitized: "Netherlands the",
    componentName: "NetherlandsThe",
    textName: "Netherlands (the)",
    countryFileName: "NetherlandsThe.tsx"
  },
  NO: {
    countryCode: "NO",
    countryName: "Norway",
    countryNameSanitized: "Norway",
    componentName: "Norway",
    textName: "Norway",
    countryFileName: "Norway.tsx"
  },
  NP: {
    countryCode: "NP",
    countryName: "Nepal",
    countryNameSanitized: "Nepal",
    componentName: "Nepal",
    textName: "Nepal",
    countryFileName: "Nepal.tsx"
  },
  NR: {
    countryCode: "NR",
    countryName: "Nauru",
    countryNameSanitized: "Nauru",
    componentName: "Nauru",
    textName: "Nauru",
    countryFileName: "Nauru.tsx"
  },
  NU: {
    countryCode: "NU",
    countryName: "Niue",
    countryNameSanitized: "Niue",
    componentName: "Niue",
    textName: "Niue",
    countryFileName: "Niue.tsx"
  },
  NZ: {
    countryCode: "NZ",
    countryName: "New Zealand",
    countryNameSanitized: "New Zealand",
    componentName: "NewZealand",
    textName: "New Zealand",
    countryFileName: "NewZealand.tsx"
  },
  OM: {
    countryCode: "OM",
    countryName: "Oman",
    countryNameSanitized: "Oman",
    componentName: "Oman",
    textName: "Oman",
    countryFileName: "Oman.tsx"
  },
  PA: {
    countryCode: "PA",
    countryName: "Panama",
    countryNameSanitized: "Panama",
    componentName: "Panama",
    textName: "Panama",
    countryFileName: "Panama.tsx"
  },
  PE: {
    countryCode: "PE",
    countryName: "Peru",
    countryNameSanitized: "Peru",
    componentName: "Peru",
    textName: "Peru",
    countryFileName: "Peru.tsx"
  },
  PF: {
    countryCode: "PF",
    countryName: "French Polynesia",
    countryNameSanitized: "French Polynesia",
    componentName: "FrenchPolynesia",
    textName: "French Polynesia",
    countryFileName: "FrenchPolynesia.tsx"
  },
  PG: {
    countryCode: "PG",
    countryName: "Papua New Guinea",
    countryNameSanitized: "Papua New Guinea",
    componentName: "PapuaNewGuinea",
    textName: "Papua New Guinea",
    countryFileName: "PapuaNewGuinea.tsx"
  },
  PH: {
    countryCode: "PH",
    countryName: "Philippines (the)",
    countryNameSanitized: "Philippines the",
    componentName: "PhilippinesThe",
    textName: "Philippines (the)",
    countryFileName: "PhilippinesThe.tsx"
  },
  PK: {
    countryCode: "PK",
    countryName: "Pakistan",
    countryNameSanitized: "Pakistan",
    componentName: "Pakistan",
    textName: "Pakistan",
    countryFileName: "Pakistan.tsx"
  },
  PL: {
    countryCode: "PL",
    countryName: "Poland",
    countryNameSanitized: "Poland",
    componentName: "Poland",
    textName: "Poland",
    countryFileName: "Poland.tsx"
  },
  PM: {
    countryCode: "PM",
    countryName: "Saint Pierre and Miquelon",
    countryNameSanitized: "Saint Pierre and Miquelon",
    componentName: "SaintPierreAndMiquelon",
    textName: "Saint Pierre and Miquelon",
    countryFileName: "SaintPierreAndMiquelon.tsx"
  },
  PN: {
    countryCode: "PN",
    countryName: "Pitcairn",
    countryNameSanitized: "Pitcairn",
    componentName: "Pitcairn",
    textName: "Pitcairn",
    countryFileName: "Pitcairn.tsx"
  },
  PR: {
    countryCode: "PR",
    countryName: "Puerto Rico",
    countryNameSanitized: "Puerto Rico",
    componentName: "PuertoRico",
    textName: "Puerto Rico",
    countryFileName: "PuertoRico.tsx"
  },
  PS: {
    countryCode: "PS",
    countryName: "Palestine (State of)",
    countryNameSanitized: "Palestine State of",
    componentName: "PalestineStateOf",
    textName: "Palestine (State of)",
    countryFileName: "PalestineStateOf.tsx"
  },
  PT: {
    countryCode: "PT",
    countryName: "Portugal",
    countryNameSanitized: "Portugal",
    componentName: "Portugal",
    textName: "Portugal",
    countryFileName: "Portugal.tsx"
  },
  PW: {
    countryCode: "PW",
    countryName: "Palau",
    countryNameSanitized: "Palau",
    componentName: "Palau",
    textName: "Palau",
    countryFileName: "Palau.tsx"
  },
  PY: {
    countryCode: "PY",
    countryName: "Paraguay",
    countryNameSanitized: "Paraguay",
    componentName: "Paraguay",
    textName: "Paraguay",
    countryFileName: "Paraguay.tsx"
  },
  QA: {
    countryCode: "QA",
    countryName: "Qatar",
    countryNameSanitized: "Qatar",
    componentName: "Qatar",
    textName: "Qatar",
    countryFileName: "Qatar.tsx"
  },
  RE: {
    countryCode: "RE",
    countryName: "Réunion",
    countryNameSanitized: "Reunion",
    componentName: "Reunion",
    textName: "Réunion",
    countryFileName: "Reunion.tsx"
  },
  RO: {
    countryCode: "RO",
    countryName: "Romania",
    countryNameSanitized: "Romania",
    componentName: "Romania",
    textName: "Romania",
    countryFileName: "Romania.tsx"
  },
  RS: {
    countryCode: "RS",
    countryName: "Serbia",
    countryNameSanitized: "Serbia",
    componentName: "Serbia",
    textName: "Serbia",
    countryFileName: "Serbia.tsx"
  },
  RU: {
    countryCode: "RU",
    countryName: "Russian Federation (the)",
    countryNameSanitized: "Russian Federation the",
    componentName: "RussianFederationThe",
    textName: "Russian Federation (the)",
    countryFileName: "RussianFederationThe.tsx"
  },
  RW: {
    countryCode: "RW",
    countryName: "Rwanda",
    countryNameSanitized: "Rwanda",
    componentName: "Rwanda",
    textName: "Rwanda",
    countryFileName: "Rwanda.tsx"
  },
  SA: {
    countryCode: "SA",
    countryName: "Saudi Arabia",
    countryNameSanitized: "Saudi Arabia",
    componentName: "SaudiArabia",
    textName: "Saudi Arabia",
    countryFileName: "SaudiArabia.tsx"
  },
  SB: {
    countryCode: "SB",
    countryName: "Solomon Islands",
    countryNameSanitized: "Solomon Islands",
    componentName: "SolomonIslands",
    textName: "Solomon Islands",
    countryFileName: "SolomonIslands.tsx"
  },
  SC: {
    countryCode: "SC",
    countryName: "Seychelles",
    countryNameSanitized: "Seychelles",
    componentName: "Seychelles",
    textName: "Seychelles",
    countryFileName: "Seychelles.tsx"
  },
  SD: {
    countryCode: "SD",
    countryName: "Sudan (the)",
    countryNameSanitized: "Sudan the",
    componentName: "SudanThe",
    textName: "Sudan (the)",
    countryFileName: "SudanThe.tsx"
  },
  SE: {
    countryCode: "SE",
    countryName: "Sweden",
    countryNameSanitized: "Sweden",
    componentName: "Sweden",
    textName: "Sweden",
    countryFileName: "Sweden.tsx"
  },
  SG: {
    countryCode: "SG",
    countryName: "Singapore",
    countryNameSanitized: "Singapore",
    componentName: "Singapore",
    textName: "Singapore",
    countryFileName: "Singapore.tsx"
  },
  SH: {
    countryCode: "SH",
    countryName: "Saint Helena, Ascension and Tristan da Cunha",
    countryNameSanitized: "Saint Helena Ascension and Tristan da Cunha",
    componentName: "SaintHelenaAscensionAndTristanDaCunha",
    textName: "Saint Helena, Ascension and Tristan da Cunha",
    countryFileName: "SaintHelenaAscensionAndTristanDaCunha.tsx"
  },
  SI: {
    countryCode: "SI",
    countryName: "Slovenia",
    countryNameSanitized: "Slovenia",
    componentName: "Slovenia",
    textName: "Slovenia",
    countryFileName: "Slovenia.tsx"
  },
  SJ: {
    countryCode: "SJ",
    countryName: "Svalbard and Jan Mayen",
    countryNameSanitized: "Svalbard and Jan Mayen",
    componentName: "SvalbardAndJanMayen",
    textName: "Svalbard and Jan Mayen",
    countryFileName: "SvalbardAndJanMayen.tsx"
  },
  SK: {
    countryCode: "SK",
    countryName: "Slovakia",
    countryNameSanitized: "Slovakia",
    componentName: "Slovakia",
    textName: "Slovakia",
    countryFileName: "Slovakia.tsx"
  },
  SL: {
    countryCode: "SL",
    countryName: "Sierra Leone",
    countryNameSanitized: "Sierra Leone",
    componentName: "SierraLeone",
    textName: "Sierra Leone",
    countryFileName: "SierraLeone.tsx"
  },
  SM: {
    countryCode: "SM",
    countryName: "San Marino",
    countryNameSanitized: "San Marino",
    componentName: "SanMarino",
    textName: "San Marino",
    countryFileName: "SanMarino.tsx"
  },
  SN: {
    countryCode: "SN",
    countryName: "Senegal",
    countryNameSanitized: "Senegal",
    componentName: "Senegal",
    textName: "Senegal",
    countryFileName: "Senegal.tsx"
  },
  SO: {
    countryCode: "SO",
    countryName: "Somalia",
    countryNameSanitized: "Somalia",
    componentName: "Somalia",
    textName: "Somalia",
    countryFileName: "Somalia.tsx"
  },
  SR: {
    countryCode: "SR",
    countryName: "Suriname",
    countryNameSanitized: "Suriname",
    componentName: "Suriname",
    textName: "Suriname",
    countryFileName: "Suriname.tsx"
  },
  SS: {
    countryCode: "SS",
    countryName: "South Sudan",
    countryNameSanitized: "South Sudan",
    componentName: "SouthSudan",
    textName: "South Sudan",
    countryFileName: "SouthSudan.tsx"
  },
  ST: {
    countryCode: "ST",
    countryName: "Sao Tome and Principe",
    countryNameSanitized: "Sao Tome and Principe",
    componentName: "SaoTomeAndPrincipe",
    textName: "Sao Tome and Principe",
    countryFileName: "SaoTomeAndPrincipe.tsx"
  },
  SV: {
    countryCode: "SV",
    countryName: "El Salvador",
    countryNameSanitized: "El Salvador",
    componentName: "ElSalvador",
    textName: "El Salvador",
    countryFileName: "ElSalvador.tsx"
  },
  SX: {
    countryCode: "SX",
    countryName: "Sint Maarten (Dutch part)",
    countryNameSanitized: "Sint Maarten Dutch part",
    componentName: "SintMaartenDutchPart",
    textName: "Sint Maarten (Dutch part)",
    countryFileName: "SintMaartenDutchPart.tsx"
  },
  SY: {
    countryCode: "SY",
    countryName: "Syrian Arab Republic (the)",
    countryNameSanitized: "Syrian Arab Republic the",
    componentName: "SyrianArabRepublicThe",
    textName: "Syrian Arab Republic (the)",
    countryFileName: "SyrianArabRepublicThe.tsx"
  },
  SZ: {
    countryCode: "SZ",
    countryName: "Eswatini",
    countryNameSanitized: "Eswatini",
    componentName: "Eswatini",
    textName: "Eswatini",
    countryFileName: "Eswatini.tsx"
  },
  TC: {
    countryCode: "TC",
    countryName: "Turks and Caicos Islands (the)",
    countryNameSanitized: "Turks and Caicos Islands the",
    componentName: "TurksAndCaicosIslandsThe",
    textName: "Turks and Caicos Islands (the)",
    countryFileName: "TurksAndCaicosIslandsThe.tsx"
  },
  TD: {
    countryCode: "TD",
    countryName: "Chad",
    countryNameSanitized: "Chad",
    componentName: "Chad",
    textName: "Chad",
    countryFileName: "Chad.tsx"
  },
  TF: {
    countryCode: "TF",
    countryName: "French Southern Territories (the)",
    countryNameSanitized: "French Southern Territories the",
    componentName: "FrenchSouthernTerritoriesThe",
    textName: "French Southern Territories (the)",
    countryFileName: "FrenchSouthernTerritoriesThe.tsx"
  },
  TG: {
    countryCode: "TG",
    countryName: "Togo",
    countryNameSanitized: "Togo",
    componentName: "Togo",
    textName: "Togo",
    countryFileName: "Togo.tsx"
  },
  TH: {
    countryCode: "TH",
    countryName: "Thailand",
    countryNameSanitized: "Thailand",
    componentName: "Thailand",
    textName: "Thailand",
    countryFileName: "Thailand.tsx"
  },
  TJ: {
    countryCode: "TJ",
    countryName: "Tajikistan",
    countryNameSanitized: "Tajikistan",
    componentName: "Tajikistan",
    textName: "Tajikistan",
    countryFileName: "Tajikistan.tsx"
  },
  TK: {
    countryCode: "TK",
    countryName: "Tokelau",
    countryNameSanitized: "Tokelau",
    componentName: "Tokelau",
    textName: "Tokelau",
    countryFileName: "Tokelau.tsx"
  },
  TL: {
    countryCode: "TL",
    countryName: "Timor-Leste",
    countryNameSanitized: "TimorLeste",
    componentName: "Timorleste",
    textName: "Timor-Leste",
    countryFileName: "Timorleste.tsx"
  },
  TM: {
    countryCode: "TM",
    countryName: "Turkmenistan",
    countryNameSanitized: "Turkmenistan",
    componentName: "Turkmenistan",
    textName: "Turkmenistan",
    countryFileName: "Turkmenistan.tsx"
  },
  TN: {
    countryCode: "TN",
    countryName: "Tunisia",
    countryNameSanitized: "Tunisia",
    componentName: "Tunisia",
    textName: "Tunisia",
    countryFileName: "Tunisia.tsx"
  },
  TO: {
    countryCode: "TO",
    countryName: "Tonga",
    countryNameSanitized: "Tonga",
    componentName: "Tonga",
    textName: "Tonga",
    countryFileName: "Tonga.tsx"
  },
  TR: {
    countryCode: "TR",
    countryName: "Türkiye",
    countryNameSanitized: "Turkiye",
    componentName: "Turkiye",
    textName: "Türkiye",
    countryFileName: "Turkiye.tsx"
  },
  TT: {
    countryCode: "TT",
    countryName: "Trinidad and Tobago",
    countryNameSanitized: "Trinidad and Tobago",
    componentName: "TrinidadAndTobago",
    textName: "Trinidad and Tobago",
    countryFileName: "TrinidadAndTobago.tsx"
  },
  TV: {
    countryCode: "TV",
    countryName: "Tuvalu",
    countryNameSanitized: "Tuvalu",
    componentName: "Tuvalu",
    textName: "Tuvalu",
    countryFileName: "Tuvalu.tsx"
  },
  TW: {
    countryCode: "TW",
    countryName: "Taiwan (Province of China)",
    countryNameSanitized: "Taiwan Province of China",
    componentName: "TaiwanProvinceOfChina",
    textName: "Taiwan (Province of China)",
    countryFileName: "TaiwanProvinceOfChina.tsx"
  },
  TZ: {
    countryCode: "TZ",
    countryName: "Tanzania (the United Republic of)",
    countryNameSanitized: "Tanzania the United Republic of",
    componentName: "TanzaniaTheUnitedRepublicOf",
    textName: "Tanzania (the United Republic of)",
    countryFileName: "TanzaniaTheUnitedRepublicOf.tsx"
  },
  UA: {
    countryCode: "UA",
    countryName: "Ukraine",
    countryNameSanitized: "Ukraine",
    componentName: "Ukraine",
    textName: "Ukraine",
    countryFileName: "Ukraine.tsx"
  },
  UG: {
    countryCode: "UG",
    countryName: "Uganda",
    countryNameSanitized: "Uganda",
    componentName: "Uganda",
    textName: "Uganda",
    countryFileName: "Uganda.tsx"
  },
  UM: {
    countryCode: "UM",
    countryName: "United States Minor  Outlying Islands (the)",
    countryNameSanitized: "United States Minor  Outlying Islands the",
    componentName: "UnitedStatesMinorOutlyingIslandsThe",
    textName: "United States Minor  Outlying Islands (the)",
    countryFileName: "UnitedStatesMinorOutlyingIslandsThe.tsx"
  },
  UN: {
    countryCode: "UN",
    countryName: "United Nations",
    countryNameSanitized: "United Nations",
    componentName: "UnitedNations",
    textName: "United Nations",
    countryFileName: "UnitedNations.tsx"
  },
  US: {
    countryCode: "US",
    countryName: "United States of America (the)",
    countryNameSanitized: "United States of America the",
    componentName: "UnitedStatesOfAmericaThe",
    textName: "United States of America (the)",
    countryFileName: "UnitedStatesOfAmericaThe.tsx"
  },
  UY: {
    countryCode: "UY",
    countryName: "Uruguay",
    countryNameSanitized: "Uruguay",
    componentName: "Uruguay",
    textName: "Uruguay",
    countryFileName: "Uruguay.tsx"
  },
  UZ: {
    countryCode: "UZ",
    countryName: "Uzbekistan",
    countryNameSanitized: "Uzbekistan",
    componentName: "Uzbekistan",
    textName: "Uzbekistan",
    countryFileName: "Uzbekistan.tsx"
  },
  VA: {
    countryCode: "VA",
    countryName: "Holy See (the)",
    countryNameSanitized: "Holy See the",
    componentName: "HolySeeThe",
    textName: "Holy See (the)",
    countryFileName: "HolySeeThe.tsx"
  },
  VC: {
    countryCode: "VC",
    countryName: "Saint Vincent and the Grenadines",
    countryNameSanitized: "Saint Vincent and the Grenadines",
    componentName: "SaintVincentAndTheGrenadines",
    textName: "Saint Vincent and the Grenadines",
    countryFileName: "SaintVincentAndTheGrenadines.tsx"
  },
  VE: {
    countryCode: "VE",
    countryName: "Venezuela (Bolivarian Republic of)",
    countryNameSanitized: "Venezuela Bolivarian Republic of",
    componentName: "VenezuelaBolivarianRepublicOf",
    textName: "Venezuela (Bolivarian Republic of)",
    countryFileName: "VenezuelaBolivarianRepublicOf.tsx"
  },
  VG: {
    countryCode: "VG",
    countryName: "Virgin Islands (British)",
    countryNameSanitized: "Virgin Islands British",
    componentName: "VirginIslandsBritish",
    textName: "Virgin Islands (British)",
    countryFileName: "VirginIslandsBritish.tsx"
  },
  VI: {
    countryCode: "VI",
    countryName: "Virgin Islands (U.S.)",
    countryNameSanitized: "Virgin Islands US",
    componentName: "VirginIslandsUs",
    textName: "Virgin Islands (U.S.)",
    countryFileName: "VirginIslandsUs.tsx"
  },
  VN: {
    countryCode: "VN",
    countryName: "Viet Nam",
    countryNameSanitized: "Viet Nam",
    componentName: "VietNam",
    textName: "Viet Nam",
    countryFileName: "VietNam.tsx"
  },
  VU: {
    countryCode: "VU",
    countryName: "Vanuatu",
    countryNameSanitized: "Vanuatu",
    componentName: "Vanuatu",
    textName: "Vanuatu",
    countryFileName: "Vanuatu.tsx"
  },
  WF: {
    countryCode: "WF",
    countryName: "Wallis and Futuna",
    countryNameSanitized: "Wallis and Futuna",
    componentName: "WallisAndFutuna",
    textName: "Wallis and Futuna",
    countryFileName: "WallisAndFutuna.tsx"
  },
  WS: {
    countryCode: "WS",
    countryName: "Samoa",
    countryNameSanitized: "Samoa",
    componentName: "Samoa",
    textName: "Samoa",
    countryFileName: "Samoa.tsx"
  },
  XK: {
    countryCode: "XK",
    countryName: "Kosovo (the Republic of)",
    countryNameSanitized: "Kosovo the Republic of",
    componentName: "KosovoTheRepublicOf",
    textName: "Kosovo (the Republic of)",
    countryFileName: "KosovoTheRepublicOf.tsx"
  },
  YE: {
    countryCode: "YE",
    countryName: "Yemen",
    countryNameSanitized: "Yemen",
    componentName: "Yemen",
    textName: "Yemen",
    countryFileName: "Yemen.tsx"
  },
  YT: {
    countryCode: "YT",
    countryName: "Mayotte",
    countryNameSanitized: "Mayotte",
    componentName: "Mayotte",
    textName: "Mayotte",
    countryFileName: "Mayotte.tsx"
  },
  ZA: {
    countryCode: "ZA",
    countryName: "south Africa",
    countryNameSanitized: "south Africa",
    componentName: "SouthAfrica",
    textName: "south Africa",
    countryFileName: "SouthAfrica.tsx"
  },
  ZM: {
    countryCode: "ZM",
    countryName: "Zambia",
    countryNameSanitized: "Zambia",
    componentName: "Zambia",
    textName: "Zambia",
    countryFileName: "Zambia.tsx"
  },
  ZW: {
    countryCode: "ZW",
    countryName: "Zimbabwe",
    countryNameSanitized: "Zimbabwe",
    componentName: "Zimbabwe",
    textName: "Zimbabwe",
    countryFileName: "Zimbabwe.tsx"
  }
};
