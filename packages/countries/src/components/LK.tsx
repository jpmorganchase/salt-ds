// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type LKProps = CountrySymbolProps;

const LK = forwardRef<SVGSVGElement, LKProps>(function LK(props: LKProps, ref) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="LK"
      aria-label="Sri Lanka"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-LK-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-LK-a)`}>
        <path fill="#F1B434" d="M0 0h72v72H0z" />
        <path fill="#E26E00" d="M14 6h16v60H14z" />
        <path fill="#A00009" d="M38 6h38v60H38z" />
        <path fill="#005B33" d="M0 6h14v60H0z" />
        <path
          fill="#F1B434"
          fillRule="evenodd"
          d="m53.75 27.596 2.268 2.81c.112.248.168.744-.504.744-.84 0-5.04-1.57-5.04-1.57l-1.26 1.322c-.057.248-.152.744-.085.744.067 0 1.316-.11 1.932-.165l-.42.826 1.176-.33.756.578.168-.578 1.008 1.24c.168-.303.588-.893.925-.827.42.083.588.661.42.827a1.06 1.06 0 0 0-.022.02l-.012.014-.044.046c-.159.168-.408.43-1.267.994-1.008.661-2.436 2.066-2.688 2.728-.044.117-.107.236-.18.375-.34.645-.897 1.702-.828 4.832-.896-.8-2.94-2.678-3.948-3.802v-.33c.28-.056.84-.348.84-1.075a.945.945 0 0 0-.84-.992h-.756l.336-9.836.42-4.298c.605-2.314.644-2.893.588-2.893-.868.468-2.79 2.182-3.528 5.29-.47 1.52-.532 3.444-.504 4.215v7.522l.168.33c-.449-.11-1.412-.165-1.68.496-.27.662-.113.992 0 1.075.223.193.823.628 1.428.826-.197.386-.505 1.538-.169 3.059.029.22.202.81.673 1.405v.248l-1.093-.083c-.193.082-.349.292.554.489l.035.007.504.106c-.225.406-.646 1.216-.54 1.216.108 0 .349.441.456.662.028.165.067.578 0 .909-.068.33-.42.413-.589.413-.252-.496-.587-.33-.756 0-.134.265.169.551.337.661l.84.496c0 .265-.191.496-.287.579l.035.248h.84c.084.33.319.992.588.992.268 0 .448-.662.504-.992.392-.083 1.109-.248.84-.248s-.448-.496-.504-.744c.42-.11 1.21-.463 1.008-.992-.202-.529-.532-.22-.672 0l-.336-.165c-.112-.193-.336-.694-.336-1.157 0-.463.224-.965.336-1.157-.404-.397-.392-.882-.336-1.075 1.048.425.92-.086.843-.388-.027-.109-.048-.19-.003-.19.134 0 .392-.386.504-.58l.252.331c0 1.736.252 2.728.504 2.728.201 0 .7-.386.924-.578.56.606 1.882 1.834 2.688 1.9.807.067 1.904-1.074 2.352-1.653 0 .414 2.184 1.24 2.689 1.406.35.115.539 1.753.677 2.96.06.527.112.972.163 1.172.134.53-.84 1.213-1.344 1.488h-2.185c-.28.138-.873.562-1.008 1.157-.134.595.168.579.336.496l.672-.33c.538.727 1.513.303 1.932 0 .605.727 1.653.413 2.1.165.113.055.522.165 1.26.165.925 0 1.26-.826.925-1.24-.269-.33-.112-1.074 0-1.405 1.814 0 2.38-1.377 2.436-2.066h-1.26c-.94.132-.84-.827-.672-1.323a86.35 86.35 0 0 0 1.344-2.149c.269-.463 4.704-2.01 6.889-2.727h2.184c-.135 1.256.056 1.736.168 1.818l2.352 3.472v3.554c0 .198-.448.358-.672.413-.476.055-1.512.165-1.848.165-.336 0-.644.441-.756.662-.47.86-.084.909.168.826l.756-.33c.739.727 1.54.303 1.848 0 .74.727 1.484.303 1.764 0 .4.458.85.398 1.189.353l.108-.014c.047-.005.09-.009.131-.009.269 0 .224-1.928.168-2.893.672-.397 1.176-1.818 1.344-2.48-.532.056-1.613-.049-1.68-.909-.067-.86.644-1.24 1.008-1.322.924.606 2.823 1.967 3.025 2.562.201.595-.085 2.232-.253 2.976-.7.248-2.184.76-2.52.826-.42.083-.756 1.075-.42 1.24.269.132.672-.275.84-.496.538.926 1.456.386 1.848 0 .672.728 1.513.303 1.849 0 .403.595 1.512.469 2.016.33-.168-.33-.588-1.09-.924-1.487-.336-.397-.14-1.157 0-1.488.14-.11.57-.48 1.176-1.074.756-.744.42-1.157-.252-1.405-.538-.199-.952-1.57-1.092-2.232-.27-.992.616-3.279 1.092-4.298.42-.91 1.109-3.224.504-5.207-.24-.789-.532-1.385-.893-1.837.44-.18.948-.468 1.397-.878.627-.573 1.177-1.426 1.177-2.567 0-1.148-.557-1.983-1.205-2.53a4.467 4.467 0 0 0-1.878-.921l-.095-.02h-8.935c-.698.012-1.726-.128-2.534-.54a3.573 3.573 0 0 1-.139-.076c.179-.545.618-1.257 1.452-1.237-.217-.63-1.019-1.528-2.53-.28a2.416 2.416 0 0 1-.014-.326c.024-.97.538-1.53 1.282-1.889.553-.266 1.203-.396 1.77-.439l-.164.035c.521.366 1.42 1.387.85 2.549.755.058 2.057-.379 1.731-2.457.351.047.725.11 1.107.19l-.156-.003c.337.452.793 1.594-.08 2.541.642.22 1.918.104 2.303-1.883.56.25 1.07.558 1.489.933l.48.43c.693.624 1.293 1.164 1.814 1.56.62.47 1.316.891 2.108.891v-.01c.157.055.327.085.503.085A1.5 1.5 0 0 0 85 26.356a1.5 1.5 0 0 0-1.512-1.488 1.52 1.52 0 0 0-1.29.71 6.622 6.622 0 0 1-.192-.14c-.454-.345-.98-.818-1.669-1.437l-.51-.459c-1.176-1.05-2.736-1.629-4.116-1.953a17.202 17.202 0 0 0-3.445-.432c-.875-.044-2.194.078-3.344.632-1.207.58-2.275 1.673-2.318 3.479-.023.935.245 1.688.674 2.283-1.164 1.516-.227 2.257.417 2.442-.044-.645.384-1.069.835-1.317.099.06.199.115.3.167 1.159.592 2.512.759 3.41.745h8.704c.27.071.659.235.977.504.333.28.56.643.56 1.149 0 .512-.234.912-.587 1.235-.358.327-.797.53-1.074.612l-1.479.33a11.12 11.12 0 0 0-1.062-.119c-1.881-.132-9.184.22-12.6.413-.874.067-1.093-1.35-1.093-2.066.404.397.784.165.924 0-.604-.595-.476-1.295-.336-1.57.336 0 .364-.33.336-.496v-3.39c0-.66-.504-1.266-.756-1.487 1.143-.264 1.26-1.653 1.176-2.314-.392.468-1.31 1.24-1.848.578-.672-.826-1.68-1.074-2.016-1.074-.269 0-.504.716-.588 1.074-.392-.413-1.294-1.256-1.764-1.322-.47-.066-.644.854-.672 1.322h-.42c-2.184-1.322-2.856-.413-2.604 0 .201.331-.532.8-.924.992-.538-.066-2.745.358-3.78.579v-.992c-.874-.86-1.653-.358-1.933 0v2.232l2.772 2.48.252-.662.924.661.42-.66Zm15.12-.985-.183-.267c.053.095.115.183.184.267Z"
          clipRule="evenodd"
        />
      </g>
    </CountrySymbol>
  );
});

export default LK;
