import {
  Display3,
  FlexItem,
  FlexLayout,
  StackLayout,
  Text,
  useTheme,
} from "@salt-ds/core";
import { US } from "@salt-ds/countries";
import { ArrowDownIcon, ArrowUpIcon } from "@salt-ds/icons";
import type { ElementType } from "react";

export interface StockCardData {
  ticker: string;
  fullName: string;
  exchange: string;
  trendImage: string;
  trendImageDark: string;
  isPositive: boolean;
  changeText: string;
  changeColor: "success" | "error";
  metrics: {
    lastPrice: string;
    absolute: string;
    marketCap: string;
  };
}

export interface StockCardProps {
  stock: StockCardData;
  stockNameDisplay: "tickerOnly" | "fullNameTicker" | string;
  exchangeAndRegionDisplay: "text" | "flag" | "both" | string;
  visibleMetrics: "lastPrice" | "absolute" | "marketCap" | string;
  performanceChart: boolean;
  tickerAs?: ElementType;
}

const getDisplayMetric = (
  stock: StockCardData,
  visibleMetrics: StockCardProps["visibleMetrics"],
) => {
  if (visibleMetrics === "absolute") {
    return stock.metrics.absolute;
  }

  if (visibleMetrics === "marketCap") {
    return stock.metrics.marketCap;
  }

  return stock.metrics.lastPrice;
};

export const StockCard = ({
  stock,
  stockNameDisplay,
  exchangeAndRegionDisplay,
  visibleMetrics,
  performanceChart,
  tickerAs = "h3",
}: StockCardProps) => {
  const { mode } = useTheme();

  const showExchangeText = exchangeAndRegionDisplay !== "flag";
  const showFlag = exchangeAndRegionDisplay !== "text";

  return (
    <StackLayout gap={1}>
      <FlexLayout justify="space-between">
        <FlexItem>
          <Text as={tickerAs} styleAs="h3" style={{ margin: 0 }}>
            {stock.ticker}
          </Text>
          {stockNameDisplay === "fullNameTicker" && (
            <Text color="secondary">{stock.fullName}</Text>
          )}
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

      <Display3>
        {getDisplayMetric(stock, visibleMetrics)}
        {stock.isPositive ? (
          <ArrowUpIcon
            aria-hidden
            style={{
              color: "var(--salt-sentiment-positive-foreground-informative)",
            }}
          />
        ) : (
          <ArrowDownIcon
            aria-hidden
            style={{
              color: "var(--salt-sentiment-negative-foreground-informative)",
            }}
          />
        )}
      </Display3>
      <Text color={stock.changeColor}>{stock.changeText}</Text>

      {performanceChart && (
        <img
          src={mode === "dark" ? stock.trendImageDark : stock.trendImage}
          alt=""
          style={{ width: "100%" }}
          height={64}
          aria-hidden
        />
      )}
    </StackLayout>
  );
};
