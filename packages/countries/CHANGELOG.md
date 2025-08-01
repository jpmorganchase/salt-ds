# @salt-ds/countries

## 1.4.19

### Patch Changes

- Updated dependencies [c58279f]
- Updated dependencies [239d20c]
- Updated dependencies [fe8da62]
  - @salt-ds/core@1.47.4

## 1.4.18

### Patch Changes

- Updated dependencies [55e7bc5]
- Updated dependencies [3481308]
- Updated dependencies [851e4cb]
  - @salt-ds/core@1.47.3

## 1.4.17

### Patch Changes

- Updated dependencies [cdce628]
- Updated dependencies [454686b]
- Updated dependencies [f25a82b]
- Updated dependencies [6bc8e53]
  - @salt-ds/core@1.47.2

## 1.4.16

### Patch Changes

- 5beedbb: Improved the accuracy of various country symbols.
- Updated dependencies [62975de]
- Updated dependencies [b96166e]
- Updated dependencies [73ccf6b]
- Updated dependencies [95dd874]
- Updated dependencies [c93c943]
- Updated dependencies [104d776]
- Updated dependencies [621253b]
  - @salt-ds/core@1.47.1

## 1.4.15

### Patch Changes

- Updated dependencies [b99afaa]
- Updated dependencies [edcd33d]
- Updated dependencies [a3a0608]
- Updated dependencies [0c140c0]
  - @salt-ds/core@1.47.0

## 1.4.14

### Patch Changes

- Updated dependencies [f107d63]
  - @salt-ds/core@1.46.1

## 1.4.13

### Patch Changes

- Updated dependencies [8b4cbfb]
- Updated dependencies [bbdf4a6]
- Updated dependencies [ec1736e]
  - @salt-ds/core@1.46.0

## 1.4.12

### Patch Changes

- Updated dependencies [c664e97]
- Updated dependencies [06232b0]
  - @salt-ds/core@1.45.0

## 1.4.11

### Patch Changes

- Updated dependencies [851b2eb]
  - @salt-ds/core@1.44.1

## 1.4.10

### Patch Changes

- Updated dependencies [7fe2106]
  - @salt-ds/core@1.44.0

## 1.4.9

### Patch Changes

- Updated dependencies [78eaee3]
- Updated dependencies [20abfb6]
- Updated dependencies [c59472d]
- Updated dependencies [2bdfbfb]
- Updated dependencies [0073384]
- Updated dependencies [ef8f30a]
  - @salt-ds/core@1.43.0

## 1.4.8

### Patch Changes

- Updated dependencies [38da566]
- Updated dependencies [32de853]
- Updated dependencies [aac1500]
- Updated dependencies [803d0c0]
- Updated dependencies [7a84d72]
- Updated dependencies [e783dd5]
- Updated dependencies [c30b6a4]
  - @salt-ds/core@1.42.0

## 1.4.7

### Patch Changes

- Updated dependencies [90b85d4]
- Updated dependencies [90b85d4]
- Updated dependencies [fd86394]
- Updated dependencies [56a997c]
- Updated dependencies [9a75603]
- Updated dependencies [7510f56]
- Updated dependencies [98d3aac]
- Updated dependencies [ea5fc00]
- Updated dependencies [ba0f436]
  - @salt-ds/core@1.41.0

## 1.4.6

### Patch Changes

- Updated dependencies [6a0db8d]
- Updated dependencies [3b1c265]
- Updated dependencies [1436b36]
- Updated dependencies [39bd967]
- Updated dependencies [efb37a0]
  - @salt-ds/core@1.40.0

## 1.4.5

### Patch Changes

- Updated dependencies [373717d]
- Updated dependencies [225a61b]
- Updated dependencies [c5d61e2]
  - @salt-ds/core@1.39.0

## 1.4.4

### Patch Changes

- 0a5b68b: Marked CSS files as having side effects. This fixes Webpack tree-shaking CSS files when `sideEffects: true` is not set on style-loader rules.
- Updated dependencies [86d2a28]
- Updated dependencies [dedbade]
- Updated dependencies [0a5b68b]
- Updated dependencies [cd98ba5]
- Updated dependencies [bfea9b3]
  - @salt-ds/core@1.38.0

## 1.4.3

### Patch Changes

- Updated dependencies [5cf214c]
- Updated dependencies [bae6882]
  - @salt-ds/core@1.37.3

## 1.4.2

### Patch Changes

- Updated dependencies [ae6e5c9]
- Updated dependencies [b395246]
- Updated dependencies [aced985]
- Updated dependencies [7432f62]
- Updated dependencies [0730eb0]
- Updated dependencies [1a29b4e]
- Updated dependencies [6b1f109]
- Updated dependencies [26bf747]
- Updated dependencies [6a08b82]
  - @salt-ds/core@1.37.2

## 1.4.1

### Patch Changes

- c9e932d: Fixed LazyCountrySymbol crash with invalid code, and `sharp` was not working correctly.

## 1.4.0

### Minor Changes

- 40e9372: Expose a CSS file that allows Salt to be used without runtime CSS injection.

  ```tsx
  import "@salt-ds/countries/css/salt-countries.css";
  ```

## 1.3.1

### Patch Changes

- 361edb3d: Remove `<countryCode>_Sharp` entries in countryMetaMap. This was added incorrectly and makes using the map to convert between country codes and country names more difficult.
- af21bfb3: Fixed `saltSharpCountries.css` not being shipped as part of the package.

## 1.3.0

### Minor Changes

- a3669c40: Add "sharp" variant for all country flags.

  - Default (round): `<TT />`
  - Sharp (rectangular): `<TT_Sharp />`

## 1.2.0

### Minor Changes

- 3f128710: Added `saltCountries.css` with country SVG as background image.

  ```js
  import "@salt-ds/countries/saltCountries.css";

  const Example = () => {
    const countryCode = `AD`;
    return <div className={`saltCountry-${countryCode}`} />;
  };
  ```

## 1.1.4

### Patch Changes

- f0d5b359: Update country symbols to use useid to generate ids

## 1.1.3

### Patch Changes

- f7fcbd11: Fixed issue where components are not injecting their styles.

## 1.1.2

### Patch Changes

- abfc4364: Corrected the minimum supported version of React. It has been updated to 16.14.0 due to the support for the new [JSX transform](https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html)

## 1.1.1

### Patch Changes

- cc1f2d46: Bump countries version to fix package publishing

## 1.1.0

### Minor Changes

- d78ff537: Refactored all components to use new style injection mechanism provided by `@salt-ds/styles`

## 1.0.1

### Patch Changes

- 1e9ef1a2: Fix duplicate Salt libraries being installed when multiple libraries are installed

## 1.0.0

### Major Changes

- f6f10541: # Added countries package

  ## CountrySymbol

  Added the countries package which contains all the `CountrySymbol` components.

  The following `CountrySymbol` components are now available (names by the appropriate country code):

  - AD (Andorra)
  - AE (United Arab Emirates (the))
  - AF (Afganistan)
  - AG (Antigua and Barbuda)
  - AI (Anguilla)
  - AL (Albania)
  - AM (Armenia)
  - AO (Angola)
  - AQ (Antarctica)
  - AR (Argentina)
  - AS (American Samoa)
  - AT (Austria)
  - AU (Australia)
  - AW (Aruba)
  - AX (Åland Islands)
  - AZ (Azerbaijan)
  - BA (Bosnia and Herzegovina)
  - BB (Barbados)
  - BD (Bangladesh)
  - BE (Belgium)
  - BF (Burkina Faso)
  - BG (Bulgaria)
  - BH (Bahrain)
  - BI (Burundi)
  - BJ (Benin)
  - BL (Saint Barthélemy)
  - BM (Bermuda)
  - BN (Brunei Darussalam)
  - BO (Bolivia (Plurinational State of))
  - BQ (Bonaire Sint Eustatius and Saba)
  - BR (Brazil)
  - BS (Bahamas (the))
  - BT (Bhutan)
  - BV (Bouvet Island)
  - BY (Belarus)
  - BZ (Belize)
  - CA (Canada)
  - CC (Cocos (Keeling) Islands (the))
  - CD (Congo (the Democratic Republic of the))
  - CF (Central African Republic (the))
  - CG (Congo (the))
  - CH (Switzerland)
  - CI (Côte d'Ivoire)
  - CK (Cook Islands (the))
  - CL (Chile)
  - CM (Cameroon)
  - CN (China)
  - CO (Colombia)
  - CR (Costa Rica)
  - CU (Cuba)
  - CV (Cabo Verde)
  - CW (Curaçao)
  - CX (Christmas Island)
  - CY (Cyprus)
  - CZ (Czechia)
  - DE (Germany)
  - DJ (Djibouti)
  - DK (Denmark)
  - DM (Dominica)
  - DO (Dominican Republic (the))
  - DZ (Algeria)
  - EC (Ecuador)
  - EE (Estonia)
  - EG (Egypt)
  - EH (Western Sahara)
  - ER (Eritrea)
  - ES (Spain)
  - ET (Ethiopia)
  - EU (European Union)
  - FI (Finland)
  - FJ (Fiji)
  - FK (Falkland Islands (the) [Malvinas])
  - FM (Micronesia (Federated States of))
  - FO (Faroe Islands (the))
  - FR (France)
  - GA (Gabon)
  - GB (Great Britain)
  - GB-ENG (England)
  - GB-NIR (Northern Ireland)
  - GB-SCT (Scotland)
  - GB-WLS (Wales)
  - GD (Grenada)
  - GE (Georgia)
  - GF (French Guiana)
  - GG (Guernsey)
  - GH (Ghana)
  - GI (Gibraltar)
  - GL (Greenland)
  - GM (Gambia (the))
  - GN (Guinea)
  - GP (Guadeloupe)
  - GQ (Equatorial Guinea)
  - GR (Greece)
  - GS (South Georgia and the South Sandwich Islands)
  - GT (Guatemala)
  - GU (Guam)
  - GW (Guinea-Bissau)
  - GY (Guyana)
  - HK (Hong Kong)
  - HM (Heard Island and McDonald Islands)
  - HN (Honduras)
  - HR (Croatia)
  - HT (Haiti)
  - HU (Hungary)
  - ID (Indonisia)
  - IE (Ireland)
  - IL (Israel)
  - IM (Isle of Man)
  - IN (India)
  - IO (British Indian Ocean Territory (the))
  - IQ (Iraq)
  - IR (Iran (Islamic Republic of))
  - IS (Iceland)
  - IT (Italy)
  - JE (Jersey)
  - JM (Jamaica)
  - JO (Jordan)
  - JP (Japan)
  - KE (Kenya)
  - KG (Kyrgyzstan)
  - KH (Cambodia)
  - KI (Kiribati)
  - KM (Comoros (the))
  - KN (Saint Kitts and Nevis)
  - KP (Korea (Democratic People's Republic of))
  - KR (Korea (Republic of))
  - KW (Kuwait)
  - KY (Cayman Islands (the))
  - KZ (Kazakhstan)
  - LA (Lao People's Democratic Republic (the))
  - LB (Lebanon)
  - LC (Saint Lucia)
  - LI (Liechtenstein)
  - LK (Sri Lanka)
  - LR (Liberia)
  - LS (Lesotho)
  - LT (Lithuania)
  - LU (Luxembourg)
  - LV (Latvia)
  - LY (Libya)
  - MA (Morocco)
  - MC (Monaco)
  - MD (Moldova (the Republic of))
  - ME (Montenegro)
  - MF (Saint Martin (French part))
  - MG (Madagascar)
  - MH (Marshall Islands (the))
  - MK (North Macedonia)
  - ML (Mali)
  - MM (Myanmar)
  - MN (Mongolia)
  - MO (Macao)
  - MP (Northern Mariana Islands (the))
  - MQ (Martinique)
  - MR (Mauritania)
  - MS (Montserrat)
  - MT (Malta)
  - MU (Mauritius)
  - MV (Maldives)
  - MW (Malawi)
  - MX (Mexico)
  - MY (Malaysia)
  - MZ (Mozambique)
  - NA (Namibia)
  - NC (New Caledonia)
  - NE (Niger (the))
  - NF (Norfolk Island)
  - NG (Nigeria)
  - NI (Nicaragua)
  - NL (Netherlands (the))
  - NO (Norway)
  - NP (Nepal)
  - NR (Nauru)
  - NU (Niue)
  - NZ (New Zealand)
  - OM (Oman)
  - PA (Panama)
  - PE (Peru)
  - PF (French Polynesia)
  - PG (Papua New Guinea)
  - PH (Philippines (the))
  - PK (Pakistan)
  - PL (Poland)
  - PM (Saint Pierre and Miquelon)
  - PN (Pitcairn)
  - PR (Puerto Rico)
  - PS (Palestine (State of))
  - PT (Portugal)
  - PW (Palau)
  - PY (Paraguay)
  - QA (Qatar)
  - RE (Réunion)
  - RO (Romania)
  - RS (Serbia)
  - RU (Russian Federation (the))
  - RW (Rwanda)
  - SA (Saudi Arabia)
  - SB (Solomon Islands)
  - SC (Seychelles)
  - SD (Sudan (the))
  - SE (Sweden)
  - SG (Singapore)
  - SH (Saint Helena, Ascension and Tristan da Cunha)
  - SI (Slovenia)
  - SJ (Svalbard and Jan Mayen)
  - SK (Slovakia)
  - SL (Sierra Leone)
  - SM (San Marino)
  - SN (Senegal)
  - SO (Somalia)
  - SR (Suriname)
  - SS (South Sudan)
  - ST (Sao Tome and Principe)
  - SV (El Salvador)
  - SX (Sint Maarten (Dutch part))
  - SY (Syrian Arab Republic (the))
  - SZ (Eswatini)
  - TC (Turks and Caicos Islands (the))
  - TD (Chad)
  - TF (French Southern Territories (the))
  - TG (Togo)
  - TH (Thailand)
  - TJ (Tajikistan)
  - TK (Tokelau)
  - TL (Timor-Leste)
  - TM (Turkmenistan)
  - TN (Tunisia)
  - TO (Tonga)
  - TR (Türkiye)
  - TT (Trinidad and Tobago)
  - TV (Tuvalu)
  - TW (Taiwan (Province of China))
  - TZ (Tanzania (the United Republic of))
  - UA (Ukraine)
  - UG (Uganda)
  - UM (United States Minor Outlying Islands (the))
  - UN (United Nations)
  - US (United States of America (the))
  - UY (Uruguay)
  - UZ (Uzbekistan)
  - VA (Holy See (the))
  - VC (Saint Vincent and the Grenadines)
  - VE (Venezuela (Bolivarian Republic of))
  - VG (Virgin Islands (British))
  - VI (Virgin Islands (U.S.))
  - VN (Viet Nam)
  - VU (Vanuatu)
  - WF (Wallis and Futuna)
  - WS (Samoa)
  - XK (Kosovo (the Republic of))
  - YE (Yemen)
  - YT (Mayotte)
  - ZA (south Africa)
  - ZM (Zambia)
  - ZW (Zimbabwe)

  ### Import

  ```jsx
  import { AD } from "@salt-ds/countries;";
  ```

  ### Usage

  ```jsx
  <AD size={1} />
  ```

  ## LazyCountrySymbol

  The `LazyCountrySymbol` component is also available to lazy load different `CountrySymbol` components by country code.

  ### Import

  ```jsx
  import { LazyCountrySymbol } from "@salt-ds/countries;";
  ```

  ### Usage

  ```jsx
  <LazyCountrySymbol size={1} code="AD" />
  ```

  ## countryMetaMap

  For convenience an object `countryMetaMap` is exported which you can use to map a countryCode to the full text of a countryName

  ### Import

  ```jsx
  import { countryMetaMap } from "@salt-ds/countries;";
  ```

  ### Usage

  ```jsx
  const countryName = countryMetaMap.AD.countryName;
  ```
