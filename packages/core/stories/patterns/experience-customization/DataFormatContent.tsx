import {
  Card,
  FormField,
  FormFieldLabel,
  GridItem,
  GridLayout,
  RadioButton,
  RadioButtonGroup,
  StackLayout,
  Switch,
} from "@salt-ds/core";
import type { FormContentProps } from "./experience-customization.stories";
import NegativeTrend from "./img/negative-trend.png";
import NegativeTrendDark from "./img/negative-trend-dark.png";
import PositiveTrend from "./img/positive-trend.png";
import PositiveTrendDark from "./img/positive-trend-dark.png";
import {
  StockCard,
  type StockCardData,
  type StockCardProps,
} from "./StockCard";

export interface DataFormatContentProps extends FormContentProps {
  tickerAs?: StockCardProps["tickerAs"];
}

const stockCards: StockCardData[] = [
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
  tickerAs,
}: DataFormatContentProps) => {
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
              <StockCard
                key={stock.ticker}
                stock={stock}
                stockNameDisplay={formData.stockNameDisplay}
                exchangeAndRegionDisplay={formData.exchangeAndRegionDisplay}
                visibleMetrics={formData.visibleMetrics}
                performanceChart={formData.performanceChart}
                tickerAs={tickerAs}
              />
            ))}
          </StackLayout>
        </Card>
      </GridItem>
    </GridLayout>
  );
};
