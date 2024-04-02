// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type MXProps = CountrySymbolProps;

const MX = forwardRef<SVGSVGElement, MXProps>(function MX(props: MXProps, ref) {
  const uid = useId(props.id);

  const viewBoxValue = props.variant === "sharp" ? "0 0 72 50" : "0 0 72 72";

  return (
    <CountrySymbol
      data-testid="MX"
      aria-label="Mexico"
      viewBox={viewBoxValue}
      ref={ref}
      {...props}
    >
      {props.variant !== "sharp" && (
        <>
          <mask
            id={`${uid}-MX-a`}
            x="0"
            y="0"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
          >
            <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
          </mask>
          <g mask={`url(#${uid}-MX-a)`}>
            <path fill="#DD2033" d="M56 0h16v72H56z" />
            <path fill="#F5F7F8" d="M16 0h40v72H16z" />
            <path fill="#008259" d="M0 0h16v72H0z" />
            <path
              fill="#009B77"
              d="M18.406 29.655a18.074 18.074 0 0 0-.406 3.82c0 9.941 8.059 18 18 18s18-8.059 18-18c0-1.339-.146-2.643-.423-3.899l-2.775 1.2c.13.796.198 1.612.198 2.444 0 8.285-6.716 15-15 15-8.284 0-15-6.715-15-15 0-.804.063-1.593.185-2.363l-2.779-1.201Z"
            />
            <path
              fill="#936846"
              d="M43.066 38.7c-1.664-1.27-2.83-2.16-3.781-7.617a9.041 9.041 0 0 1 8.371 9.016c.702-1.58.883-2.427 1.093-3.412.072-.341.148-.698.251-1.108 0-8.004-6.082-14.359-12.91-14.359-.079 0-.158.001-.236.003-.545.012-.665.85-.254 1.208a4.908 4.908 0 0 1 1.686 3.708c0 .651-.126 1.273-.356 1.841a4.881 4.881 0 0 0-.418-.213c-.7-2.559-2.826-4.42-5.341-4.42-2.337 0-4.338 1.606-5.171 3.886.652-.609 1.421-.96 2.246-.96 1.264 0 2.399.826 3.178 2.138a4.91 4.91 0 0 0-1.849 3.844 4.91 4.91 0 0 0 1.966 3.934l4.682 4.442c.399.266 1.356.638 1.994 0l.266-1.463c.177.488.77 1.463 1.728 1.463H44.2c.487.044 1.063-.187-.532-1.463a33.24 33.24 0 0 0-.602-.467Z"
            />
            <path
              fill="#F1B434"
              d="M28.659 24.014c-1.198.676-2.148 1.82-2.659 3.219.652-.61 1.421-.96 2.246-.96.14 0 .277.01.413.029v-2.288Z"
            />
            <path
              fill="#009B77"
              d="M30.382 39.82c-.196-.389-.452-.514-.708-.64-.263-.128-.526-.257-.723-.67-.198-.414-.133-.699-.067-.984.065-.285.13-.57-.068-.984-.197-.413-.46-.542-.723-.67-.263-.129-.526-.257-.723-.67-.198-.414-.133-.7-.067-.984.065-.286.13-.57-.067-.984-.198-.414-.46-.542-.724-.67-.262-.129-.525-.257-.723-.67-.197-.414-.132-.7-.067-.985.065-.285.13-.57-.067-.984-.198-.413-.46-.542-.723-.67-.263-.128-.526-.257-.723-.67-.198-.414-.133-.699-.067-.984.065-.285.13-.57-.067-.984-.198-.414-.461-.542-.724-.67-.263-.129-.526-.257-.723-.67-.198-.414-.133-.7-.067-.985.065-.285.13-.57-.067-.984-.198-.413-.46-.542-.724-.67-.262-.128-.525-.257-.723-.67-.197-.414-.132-.7-.067-.984.063-.278.127-.556-.053-.953a8.389 8.389 0 0 0-1.156.533c.19.405.125.687.06.968-.065.286-.13.57.068.984.197.414.46.542.723.67.263.13.526.258.723.671.198.414.133.699.067.984-.065.285-.13.57.068.984.197.413.46.542.723.67.263.129.526.257.723.67.198.414.132.7.067.985-.065.285-.13.57.067.983.198.414.46.542.723.67.263.129.526.257.724.67.197.415.132.7.067.985-.066.285-.13.57.067.984.198.413.46.542.723.67.263.129.526.257.723.67.198.414.133.7.067.984-.065.285-.13.57.067.984.198.414.46.542.724.67.263.129.525.257.723.67.198.414.132.7.067.985-.065.285-.13.57.067.984.198.413.46.542.723.67.26.127.52.254.716.656a8.368 8.368 0 0 0 1.14-.565Z"
            />
          </g>
        </>
      )}
      {props.variant === "sharp" && (
        <>
          <mask
            id={`${uid}-MX-a`}
            x="0"
            y="0"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
          >
            <path fill="#D9D9D9" d="M0 0h72v50H0z" />
          </mask>
          <g mask={`url(#${uid}-MX-a)`}>
            <path fill="#DD2033" d="M56 0h16v50H56z" />
            <path fill="#F5F7F8" d="M16 0h40v50H16z" />
            <path fill="#008259" d="M0 0h16v50H0z" />
            <path
              fill="#009B77"
              d="M18.406 19.435a18.074 18.074 0 0 0-.406 3.82c0 9.94 8.059 18 18 18s18-8.06 18-18c0-1.339-.146-2.643-.423-3.899l-2.775 1.2c.13.795.198 1.612.198 2.444 0 8.284-6.716 15-15 15-8.284 0-15-6.716-15-15 0-.804.063-1.593.185-2.363l-2.779-1.202Z"
            />
            <path
              fill="#936846"
              d="M43.066 28.48c-1.664-1.27-2.83-2.16-3.781-7.617a9.041 9.041 0 0 1 8.371 9.016c.702-1.58.883-2.427 1.093-3.413.072-.34.148-.698.251-1.108C49 17.355 42.918 11 36.09 11c-.079 0-.158 0-.236.003-.545.011-.665.85-.254 1.208a4.908 4.908 0 0 1 1.686 3.708 4.9 4.9 0 0 1-.356 1.841 4.881 4.881 0 0 0-.418-.213c-.7-2.559-2.826-4.42-5.341-4.42-2.337 0-4.338 1.606-5.171 3.886.652-.61 1.421-.961 2.246-.961 1.264 0 2.399.827 3.178 2.14a4.91 4.91 0 0 0-1.849 3.843 4.91 4.91 0 0 0 1.966 3.934l4.682 4.441c.399.266 1.356.639 1.994 0l.266-1.462c.177.488.77 1.462 1.728 1.462H44.2c.487.045 1.063-.186-.532-1.462-.208-.166-.409-.32-.602-.468Z"
            />
            <path
              fill="#F1B434"
              d="M28.659 13.793c-1.198.677-2.148 1.822-2.659 3.22.652-.61 1.421-.961 2.246-.961.14 0 .277.01.413.03v-2.289Z"
            />
            <path
              fill="#009B77"
              d="M30.382 29.6c-.196-.389-.452-.514-.708-.64-.263-.128-.526-.257-.724-.67-.197-.414-.132-.699-.067-.984.066-.285.13-.57-.067-.984-.197-.414-.46-.542-.723-.67-.263-.129-.526-.257-.723-.67-.198-.414-.133-.7-.067-.985.065-.285.13-.57-.067-.983-.198-.414-.46-.542-.724-.67-.262-.13-.525-.258-.723-.671-.198-.414-.132-.699-.067-.984.065-.285.13-.57-.067-.984-.198-.414-.46-.542-.723-.67-.263-.129-.526-.257-.724-.67-.197-.414-.132-.7-.067-.984.066-.285.131-.57-.067-.984-.197-.414-.46-.542-.723-.67-.263-.13-.526-.258-.723-.671-.198-.414-.133-.699-.067-.984.065-.285.13-.57-.067-.984-.198-.413-.46-.542-.724-.67-.262-.128-.525-.257-.723-.67-.198-.414-.132-.7-.067-.985.063-.277.127-.556-.053-.952a8.439 8.439 0 0 0-1.156.532c.19.406.125.688.06.97-.065.284-.13.57.068.983.197.414.46.542.723.67.263.129.526.257.723.67.198.414.133.7.067.985-.065.285-.13.57.067.984.198.413.46.542.724.67.263.129.525.257.723.67.198.414.132.7.067.984-.065.286-.13.57.067.984.198.414.46.542.723.67.263.129.526.257.724.67.197.414.132.7.067.985-.066.285-.13.57.067.984.197.413.46.542.723.67.263.128.526.257.723.67.198.414.133.699.067.984-.065.285-.13.57.067.984.198.413.46.542.724.67.262.129.525.257.723.67.198.414.132.7.067.985-.065.285-.13.57.067.983.198.414.46.543.723.671.26.127.52.254.716.656a8.44 8.44 0 0 0 1.14-.565Z"
            />
          </g>
        </>
      )}
    </CountrySymbol>
  );
});

export default MX;
