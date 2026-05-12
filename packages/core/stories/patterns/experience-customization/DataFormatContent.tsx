import {
  Card,
  Display3,
  FlexItem,
  FlexLayout,
  FormField,
  FormFieldLabel,
  GridItem,
  GridLayout,
  RadioButton,
  RadioButtonGroup,
  StackLayout,
  Switch,
  Text,
  useTheme,
} from "@salt-ds/core";
import { US } from "@salt-ds/countries";
import { ArrowDownIcon, ArrowUpIcon } from "@salt-ds/icons";
import type { FormContentProps } from "./experience-customization.stories";
import NegativeTrend from "./img/negative-trend.png";
import NegativeTrendDark from "./img/negative-trend-dark.png";
import PositiveTrend from "./img/positive-trend.png";
import PositiveTrendDark from "./img/positive-trend-dark.png";

const stockCards = [
  {
    ticker: "VRT",
    fullName: "VERTIV HOLDINGS CO-A",
    exchange: "NYSE",
    trendImage: PositiveTrend,
    trendImageDark: PositiveTrendDark,
    isPositive: true,
    changeText: "+6.27 (+1.95%)",
    changeColor: "success" as const,
    metrics: {
      lastPrice: "328.02",
      absolute: "2.25",
      marketCap: "66.199B",
    },
  },
  {
    ticker: "GEV",
    fullName: "GE VERNOVA INC",
    exchange: "NYSE",
    trendImage: NegativeTrend,
    trendImageDark: NegativeTrendDark,
    isPositive: false,
    changeText: "-4.03 (-0.35%)",
    changeColor: "error" as const,
    metrics: {
      lastPrice: "1147.27",
      absolute: "-8.92",
      marketCap: "684.15B",
    },
  },
];

export const DataFormatContent = ({
  formData,
  handleRadioChange,
  handleCheckboxChange,
}: FormContentProps) => {
  const { mode } = useTheme();

  const showExchangeText = formData.exchangeAndRegionDisplay !== "flag";
  const showFlag = formData.exchangeAndRegionDisplay !== "text";
  const getDisplayMetric = (stock: (typeof stockCards)[number]) => {
    if (formData.visibleMetrics === "absolute") {
      return stock.metrics.absolute;
    }

    if (formData.visibleMetrics === "marketCap") {
      return stock.metrics.marketCap;
    }

    return stock.metrics.lastPrice;
  };

  return (
    <GridLayout columns={{ xs: 1, sm: 2 }}>
      <GridItem>
        <StackLayout>
          <FormField>
            <FormFieldLabel>Stock name display</FormFieldLabel>
            <RadioButtonGroup
              onChange={handleRadioChange}
              name="stockNameDisplay"
              value={formData.stockNameDisplay}
            >
              <RadioButton label="Ticker only" value="tickerOnly" />
              <RadioButton
                label="Ticker and full name"
                value="fullNameTicker"
              />
            </RadioButtonGroup>
          </FormField>
          <FormField>
            <FormFieldLabel>Exchange and region</FormFieldLabel>
            <RadioButtonGroup
              onChange={handleRadioChange}
              name="exchangeAndRegionDisplay"
              value={formData.exchangeAndRegionDisplay}
            >
              <RadioButton label="Text only" value="text" />
              <RadioButton label="Flag only" value="flag" />
              <RadioButton label="Both" value="both" />
            </RadioButtonGroup>
          </FormField>
          <FormField>
            <FormFieldLabel>Visible metrics</FormFieldLabel>
            <RadioButtonGroup
              onChange={handleRadioChange}
              name="visibleMetrics"
              value={formData.visibleMetrics}
            >
              <RadioButton label="Last price" value="lastPrice" />
              <RadioButton label="Absolute change" value="absolute" />
              <RadioButton label="Market Cap" value="marketCap" />
            </RadioButtonGroup>
          </FormField>

          <FormField>
            <FormFieldLabel>Performance chart</FormFieldLabel>
            <Switch
              name="performanceChart"
              checked={formData.performanceChart}
              onChange={handleCheckboxChange}
              label={formData.performanceChart ? "Visible" : "Hidden"}
            />
          </FormField>
        </StackLayout>
      </GridItem>
      <GridItem>
        <Card>
          <StackLayout separators>
            {stockCards.map((stock) => (
              <FlexItem key={stock.ticker}>
                <StackLayout gap={1}>
                  <FlexLayout justify="space-between">
                    <FlexItem>
                      <Text>
                        <strong>{stock.ticker}</strong>
                      </Text>
                      {formData.stockNameDisplay === "fullNameTicker" && (
                        <Text color="secondary">{stock.fullName}</Text>
                      )}
                      <Display3>
                        {getDisplayMetric(stock)}
                        {stock.isPositive ? (
                          <ArrowUpIcon
                            aria-hidden
                            style={{
                              color:
                                "var(--salt-sentiment-positive-foreground-informative)",
                            }}
                          />
                        ) : (
                          <ArrowDownIcon
                            aria-hidden
                            style={{
                              color:
                                "var(--salt-sentiment-negative-foreground-informative)",
                            }}
                          />
                        )}
                      </Display3>
                      <Text color={stock.changeColor}>{stock.changeText}</Text>
                    </FlexItem>
                    <FlexItem>
                      <FlexLayout gap={1} align="center">
                        {showExchangeText && (
                          <Text color="secondary">{stock.exchange}</Text>
                        )}
                        {showFlag && <US />}
                      </FlexLayout>
                    </FlexItem>
                  </FlexLayout>

                  {formData.performanceChart && (
                    <img
                      src={
                        mode === "dark"
                          ? stock.trendImageDark
                          : stock.trendImage
                      }
                      alt=""
                      style={{ width: "100%" }}
                      height={64}
                    />
                  )}
                </StackLayout>
              </FlexItem>
            ))}
          </StackLayout>
        </Card>
      </GridItem>
    </GridLayout>
  );
};
