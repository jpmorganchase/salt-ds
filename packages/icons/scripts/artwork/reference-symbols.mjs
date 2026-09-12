import { box, circ, F, group, S } from "./primitives.mjs";

// Shared constructions retain the initial design language while omitting
// details that would change each symbol's intended meaning.
const C = (x, y, r) => S(circ(x, y, r));
const squareStroke = S;

// Keep the reference sphere's central meridian, curved meridians and two
// latitudes. Secondary grid lines preserve open cells at the default 12px size.
const globeRim = circ(12, 12, 9.5);
const globeMeridian = "M12 2.5V21.5M12 2.5a5 9.5 0 1 0 0 19a5 9.5 0 1 0 0-19Z";
const globeLatitudes =
  "M3.1682391336721523 8.5H20.831760866327848M3.1682391336721523 15.5H20.831760866327848";
const globeOutline = S(globeRim) + S(globeMeridian + globeLatitudes, 1.08);
// The solid uses the same grid as transparent channels through a filled sphere.
// Latitude gaps are 1.5 construction units; the curved gaps use a true .75-unit
// normal offset of the shared curved meridian. The three central cells are
// split at x11.25/x12.75, retaining a 1.5-unit vertical channel and twelve cells.
const globeCells =
  "M11.25 3.398566C11.059764 3.474609 10.866921 3.581279 10.67099 3.72184C10.21317 4.05028 9.74958 4.56868 9.33913 5.25552C8.92868 5.94235 8.5721 6.79441 8.30532 7.75L11.25 7.75ZM12.75 3.398566C12.940236 3.474609 13.133079 3.581279 13.32901 3.72184C13.78683 4.05028 14.25042 4.56868 14.66087 5.25552C15.07132 5.94235 15.4279 6.79441 15.69468 7.75L12.75 7.75ZM9.32892 2.88324L9.32892 2.88324C8.7378 3.42288 8.2228 4.12698 7.79058 4.9526C7.35836 5.77822 7.00931 6.72655 6.75402 7.75L3.50368 7.75A9.5 9.5 0 0 1 9.32892 2.88324ZM14.67108 2.88324L14.67108 2.88324A9.5 9.5 0 0 1 20.49632 7.75L17.24598 7.75C16.99069 6.72655 16.64164 5.77822 16.20942 4.9526C15.7772 4.12698 15.2622 3.42288 14.67108 2.88324ZM11.25 9.25L7.97397 9.25C7.82619 10.13481 7.75 11.06734 7.75 12C7.75 12.93266 7.82619 13.86519 7.97397 14.75L11.25 14.75ZM12.75 9.25L16.02603 9.25C16.17381 10.13481 16.25 11.06734 16.25 12C16.25 12.93266 16.17381 13.86519 16.02603 14.75L12.75 14.75ZM2.90673 9.25L6.45505 9.25C6.319 10.14452 6.25 11.07221 6.25 12C6.25 12.92779 6.319 13.85548 6.45505 14.75L2.90673 14.75A9.5 9.5 0 0 1 2.90673 9.25ZM17.54495 9.25L21.09327 9.25A9.5 9.5 0 0 1 21.09327 14.75L17.54495 14.75C17.681 13.85548 17.75 12.92779 17.75 12C17.75 11.07221 17.681 10.14452 17.54495 9.25ZM11.25 20.601434C11.059764 20.525391 10.866921 20.418721 10.67099 20.27816C10.21317 19.94972 9.74958 19.43132 9.33913 18.74448C8.92868 18.05765 8.5721 17.20559 8.30532 16.25L11.25 16.25ZM12.75 20.601434C12.940236 20.525391 13.133079 20.418721 13.32901 20.27816C13.78683 19.94972 14.25042 19.43132 14.66087 18.74448C15.07132 18.05765 15.4279 17.20559 15.69468 16.25L12.75 16.25ZM3.50368 16.25L6.75402 16.25C7.00931 17.27345 7.35836 18.22178 7.79058 19.0474C8.2228 19.87302 8.7378 20.57712 9.32892 21.11676L9.32892 21.11676A9.5 9.5 0 0 1 3.50368 16.25ZM17.24598 16.25L20.49632 16.25A9.5 9.5 0 0 1 14.67108 21.11676L14.67108 21.11676C15.2622 20.57712 15.7772 19.87302 16.20942 19.0474C16.64164 18.22178 16.99069 17.27345 17.24598 16.25Z";
const globeSolid = F(globeCells) + S(globeRim);

// Explicit straight segments form the pointed upper cleft in both variants.
const heart =
  "M12 20.55C8.8 18.4 2.5 13.5 2.5 8.3C2.5 5.65 4.6 3.45 7.25 3.45C9.25 3.45 10.65 4.75 11.1 5.5L12 7L12.9 5.5C13.35 4.75 14.75 3.45 16.75 3.45C19.4 3.45 21.5 5.65 21.5 8.3C21.5 13.5 15.2 18.4 12 20.55Z";

// Currency and exchange share the filled dollar glyph.
const dollarSymbol =
  "M12.03 11c-.57.02-1.03-.44-1.03-1s.45-1 1-1 1 .45 1 1h2c0-1.19-.69-2.2-1.7-2.69-.18-.09-.3-.26-.3-.46V6h-2v.85c0 .2-.12.37-.3.46-1.55.75-2.36 2.78-1.01 4.72.51.73 1.39.99 2.28.96.57-.02 1.03.44 1.03 1s-.45 1-1 1-1-.45-1-1H9c0 1.19.69 2.2 1.7 2.69.18.09.3.26.3.46v.85h2v-.85c0-.2.12-.37.3-.46 1.55-.75 2.36-2.78 1.01-4.72-.51-.73-1.39-.99-2.28-.96";
// Preserve the supplied dollar/yen/euro coin triad, including the joined
// rims and relieved junctions. The expanded reference contours use 144 units;
// scale them once to the shared 24-unit construction canvas.
const exchangeCoins =
  "M101.04 59.3997C103.32 53.9997 104.13 47.8497 102.96 41.3997C100.65 28.7697 90.5401 18.5697 77.8801 16.2597C57.9301 12.6297 40.4701 27.9297 40.4701 47.2197C40.4701 50.6097 41.0101 53.9097 42.0301 56.9697C42.1501 57.2997 42.4801 58.0797 42.9601 59.0997C44.2801 61.9197 42.4201 65.2497 39.3301 65.5197C39.1801 65.5197 39.0901 65.5197 39.0001 65.5497C22.2301 67.9497 9.69006 83.6097 12.3601 101.52C14.4001 115.38 24.9601 125.88 38.8501 127.89C50.8201 129.63 61.7401 124.56 68.3701 116.01C70.2601 113.58 73.7701 113.58 75.6601 116.01C82.2901 124.56 93.2101 129.63 105.18 127.89C119.04 125.88 129.6 115.38 131.67 101.52C134.31 83.6097 121.77 67.9497 105.03 65.5497C104.97 65.5497 104.88 65.5497 104.79 65.5497C101.82 65.2197 99.9001 62.1597 101.07 59.4297L101.04 59.3997ZM72.0001 21.7497C86.0701 21.7497 97.5001 33.1797 97.5001 47.2497C97.5001 61.3197 86.0701 72.7497 72.0001 72.7497C57.9301 72.7497 46.5001 61.3197 46.5001 47.2497C46.5001 33.1797 57.9301 21.7497 72.0001 21.7497ZM43.5001 122.25C29.4301 122.25 18.0001 110.82 18.0001 96.7497C18.0001 82.6797 29.4301 71.2497 43.5001 71.2497C57.5701 71.2497 69.0001 82.6797 69.0001 96.7497C69.0001 110.82 57.5701 122.25 43.5001 122.25ZM100.5 122.25C86.4301 122.25 75.0001 110.82 75.0001 96.7497C75.0001 82.6797 86.4301 71.2497 100.5 71.2497C114.57 71.2497 126 82.6797 126 96.7497C126 110.82 114.57 122.25 100.5 122.25Z";
const exchangeYen =
  "M46.5001 95.7301L57.6301 84.6001L53.4001 80.3701L45.6301 88.1401C44.4601 89.3101 42.5701 89.3101 41.4001 88.1401L33.6301 80.3701L29.4001 84.6001L40.5301 95.7301V97.5001H34.5301V103.5H37.5301C39.1801 103.5 40.5301 104.85 40.5301 106.5V115.5H46.5301V106.5C46.5301 104.85 47.8801 103.5 49.5301 103.5H52.5301V97.5001H46.5301V95.7301H46.5001Z";
const exchangeEuro =
  "M94.5899 104.4C93.4499 103.26 92.9999 100.5 95.9999 100.5H104.49V94.4998H95.9999C92.9999 94.4998 93.4799 91.7398 94.5899 90.5998C95.0099 90.1798 95.4899 89.7898 95.9999 89.4598C99.7499 86.9698 105.15 87.3598 108.39 90.5998L112.62 86.3698C106.47 80.2198 96.4799 80.2198 90.3599 86.3698C87.3899 89.3398 85.7399 93.2998 85.7399 97.4998C85.7399 101.7 87.3899 105.66 90.3599 108.63C93.4199 111.69 97.4699 113.25 101.49 113.25C105.51 113.25 109.56 111.72 112.62 108.63L108.39 104.4C104.7 108.09 98.2799 108.09 94.5899 104.4Z";
const exchange =
  group(F(exchangeCoins + exchangeYen + exchangeEuro), "scale(.1666666667)") +
  // This is the reference dollar at exactly the same position and scale,
  // reusing Currency's contour instead of introducing a second glyph.
  group(F(dollarSymbol), "translate(6 1.75) scale(.5)");

// The initial sun design attaches short cardinal rays and long diagonal rays
// to a large circular field. Its lightning bolt is omitted from "light".
const sunRays = S(
  "M12 2V4.5M12 19.5V22M2 12H4.5M19.5 12H22M3.5 3.5L6.7 6.7M17.3 17.3L20.5 20.5M3.5 20.5L6.7 17.3M17.3 6.7L20.5 3.5",
);
const sunOutline = C(12, 12, 7.5) + sunRays;

// A broad, shallow screen and a separate base retain the initial housing
// construction. Its graph decoration is omitted for the laptop meaning.
const laptopScreen =
  "M3.5 5H20.5V15.5Q20.5 16.5 19.5 16.5H4.5Q3.5 16.5 3.5 15.5Z";
const laptopBase = "M2.5 16.5H21.5V18Q21.5 19 20.5 19H3.5Q2.5 19 2.5 18Z";
const laptopOutline = squareStroke(laptopScreen) + squareStroke(laptopBase);
const laptopSolid = F(laptopScreen) + squareStroke(laptopBase);
// Related housings use the same broad proportions. The display pedestal
// retains an open stem and filleted foot.
const displayFrame = "M2.5 3.5H21.5V17.5H2.5Z";
const displayAperture =
  "M3.75 3.5H20.25Q21.5 3.5 21.5 4.75V16.25Q21.5 17.5 20.25 17.5H3.75Q2.5 17.5 2.5 16.25V4.75Q2.5 3.5 3.75 3.5Z";
const pedestal = S(
  "M4 21H20M4 21H10Q10.5 21 10.5 20.5V18Q10.5 17.5 10 17.5M14 17.5Q13.5 17.5 13.5 18V20.5Q13.5 21 14 21H20",
);
const displayOutline = S(displayFrame) + S(displayAperture) + pedestal;
const displaySolid = F(box(2, 3, 20, 15)) + pedestal;

const browserFrame = "M2.5 3.5H21.5V20.5H2.5Z";
const browserContent =
  "M3.75 8.25H20.25Q21.5 8.25 21.5 9.5V19.25Q21.5 20.5 20.25 20.5H3.75Q2.5 20.5 2.5 19.25V9.5Q2.5 8.25 3.75 8.25Z";
const browserButtons = F(circ(5, 5.875, 0.5) + circ(7.5, 5.875, 0.5));
const browserOutline = S(browserFrame) + S(browserContent) + browserButtons;
// Fill only the header, keeping the shared stroked frame around the content.
const browserSolid =
  F(box(2.5, 3.5, 19, 4.75) + circ(5, 5.875, 0.5) + circ(7.5, 5.875, 0.5)) +
  S(browserFrame) +
  S(browserContent);
const referenceSymbols = {
  globe: [globeOutline, globeSolid],
  like: [S(heart), F(heart)],
  currency: [
    C(12, 12, 9.75) + F(dollarSymbol),
    F(circ(12, 12, 10.25) + dollarSymbol),
  ],
  "currency-exchange": [exchange],
  light: [sunOutline, F(circ(12, 12, 8)) + sunRays],
  laptop: [laptopOutline, laptopSolid],
  display: [displayOutline, displaySolid],
  browser: [browserOutline, browserSolid],
};

export default referenceSymbols;
