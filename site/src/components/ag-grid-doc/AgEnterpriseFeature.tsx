import { Link, Text } from "@salt-ds/core";
import { Icon } from "@salt-ds/icons";

export const AgEnterpriseFeature = () => {
  return (
    <Text as="span" color="inherit">
      an{" "}
      <Link
        color="accent"
        href="https://www.ag-grid.com/react-data-grid/community-vs-enterprise/"
      >
        ag grid enterprise
      </Link>{" "}
      <Icon
        style={{
          fillRule: "evenodd",
          clipRule: "evenodd",
          strokeLinejoin: "round",
          strokeMiterlimit: 2,
          fill: "#dc3545", // ag grid color
          width: "1.15em",
          height: "1.15em",
          transform: "translate(-.05em, .175em)",
        }}
        viewBox="0 0 32 32"
        aria-label="ag enterprise icon"
      >
        <path d="M16 2c7.727 0 14 6.273 14 14s-6.273 14-14 14S2 23.727 2 16 8.273 2 16 2Zm.005 3c6.071 0 11 4.929 11 11s-4.929 11-11 11-11-4.929-11-11 4.929-11 11-11Z" />
        <path d="M12.226 16.507c0 .549.12 1.05.36 1.502.24.452.554.839.945 1.158.39.32.842.568 1.357.745a4.862 4.862 0 0 0 1.596.267c.746 0 1.393-.174 1.944-.52a6.25 6.25 0 0 0 1.516-1.37l1.81 1.384c-1.33 1.721-3.193 2.58-5.588 2.58-.994 0-1.895-.168-2.702-.504a5.878 5.878 0 0 1-2.049-1.397 6.196 6.196 0 0 1-1.291-2.103 7.422 7.422 0 0 1-.452-2.62c0-.94.164-1.815.492-2.623a6.511 6.511 0 0 1 1.357-2.102 6.189 6.189 0 0 1 2.062-1.397A6.64 6.64 0 0 1 16.192 9c1.117 0 2.062.197 2.834.586.771.391 1.406.901 1.903 1.532a6.04 6.04 0 0 1 1.078 2.128c.221.79.332 1.592.332 2.407v.853H12.226Zm7.559-1.917a5.041 5.041 0 0 0-.254-1.464 3.22 3.22 0 0 0-.678-1.157 3.13 3.13 0 0 0-1.13-.772c-.453-.187-.98-.28-1.585-.28a3.93 3.93 0 0 0-3.633 2.381 3.26 3.26 0 0 0-.279 1.292h7.559Z" />
      </Icon>{" "}
      feature
    </Text>
  );
};
