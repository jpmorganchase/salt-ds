import {
  FlowLayout,
  SaltProvider,
  SaltProviderNext,
  Spinner,
  Text,
} from "@salt-ds/core";
import { Table, TBody, TD, TH, THead, TR } from "@salt-ds/lab";
import { useEffect, useState } from "react";
import { CopyToClipboard } from "../copy-to-clipboard";
import { ColorBlock } from "./style-blocks/ColorBlock";

type CssVariableData = Record<string, string>;

const foundationColors = [
  "black",
  "white",
  "brown",
  "teal",
  "gray",
  "red",
  "orange",
  "green",
  "blue",
  "purple",
];

const categoricalColors = [
  "cobalt",
  "cider",
  "plum",
  "aqua",
  "slate",
  "rose",
  "olive",
  "salmon",
  "indigo",
  "jade",
  "citrine",
  "autumn",
  "lavender",
  "ocean",
  "smoke",
  "fuchsia",
  "lime",
  "fur",
  "violet",
  "forest",
];

const ColorTable = ({
  data,
  themeNext,
}: {
  data: CssVariableData;
  themeNext?: boolean;
}) => {
  const ChosenSaltProvider = themeNext ? SaltProviderNext : SaltProvider;

  return (
    <div style={{ maxWidth: "100vw", overflowX: "auto" }}>
      <Table zebra divider="none">
        <THead>
          <TR>
            <TH>Preview</TH>
            <TH>Name</TH>
            <TH>Value</TH>
          </TR>
        </THead>
        <TBody>
          {Object.entries(data).map(([name, value]) => (
            <TR key={name}>
              <TD>
                <ChosenSaltProvider theme="">
                  <ColorBlock hideToken colorVar={name} />
                </ChosenSaltProvider>
              </TD>
              <TD>
                <FlowLayout gap={1} align="center">
                  <CopyToClipboard value={name} />
                </FlowLayout>
              </TD>
              <TD>
                <Text styleAs="code">{value}</Text>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  );
};

const rgbBasisRegex = /^rgb\(var\((.*)\)\)$/;
const saltColorTokenRegex = /^--salt-color-\w+(-\d+)?$/;

export const FoundationColorView = ({
  group,
  themeNext = false,
}: {
  group: "foundation" | "categorical";
  themeNext?: boolean;
}) => {
  const [data, setData] = useState<CssVariableData | null>(null);

  useEffect(() => {
    const fetchJsonData = async () => {
      const data = (
        await import(`./cssFoundations${themeNext ? "-next" : "-legacy"}.json`)
      ).default as CssVariableData;
      const colorKeys = Object.keys(data).filter((x) =>
        saltColorTokenRegex.test(x),
      );
      const regex = new RegExp(
        (group === "categorical" ? categoricalColors : foundationColors).join(
          "|",
        ),
      );

      setData(
        colorKeys
          .filter((x) => regex.test(x))
          .sort((a, b) => {
            if (group === "categorical") {
              return 0; // Categorical colors are not sorted,
            }

            const aColor = a.match(/--salt-color-(\w+)(-\d+)?/)?.[1];
            const bColor = b.match(/--salt-color-(\w+)(-\d+)?/)?.[1];

            if (!aColor || !bColor) {
              return 0; // Fallback if regex doesn't match
            }

            return (
              foundationColors.indexOf(aColor) -
              foundationColors.indexOf(bColor)
            );
          })
          .reduce<CssVariableData>((prev, current) => {
            const value = data[current];
            if (value.includes("rgb(")) {
              const matches = value.match(rgbBasisRegex);
              if (matches !== null) {
                prev[current] = `rgb(${data[matches[1]]})`;
              } else {
                prev[current] = value;
              }
            } else {
              prev[current] = value;
            }
            return prev;
          }, {}),
      );
    };

    fetchJsonData();
  }, [group, themeNext]);

  if (data === null) {
    return <Spinner />;
  }

  return <ColorTable data={data} themeNext={themeNext} />;
};
