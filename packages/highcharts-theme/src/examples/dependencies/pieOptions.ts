import type { Options } from "highcharts";

export const pieOptions: Options = {
  chart: {
    type: "pie",
  },
  title: {
    text: "Bank revenue mix",
    align: "center",
  },
  accessibility: {
    description:
      "A pie chart showing a breakdown of bank revenue by product line. There are 20 categories, each shown with equal share (5%) for demonstration purposes.",
  },
  tooltip: {
    enabled: false,
  },
  series: [
    {
      type: "pie",
      name: "Revenue by product line",
      data: [
        { name: "Checking Accounts", y: 5 },
        { name: "Savings Accounts", y: 5 },
        { name: "Credit Cards", y: 5 },
        { name: "Mortgages", y: 5 },
        { name: "Auto Loans", y: 5 },
        { name: "Personal Loans", y: 5 },
        { name: "Student Loans", y: 5 },
        { name: "Small Business Loans", y: 5 },
        { name: "Wealth Management", y: 5 },
        { name: "Robo-Advisory", y: 5 },
        { name: "Brokerage", y: 5 },
        { name: "Investment Banking", y: 5 },
        { name: "Asset Management", y: 5 },
        { name: "Private Banking", y: 5 },
        { name: "Treasury Services", y: 5 },
        { name: "Payments", y: 5 },
        { name: "Foreign Exchange", y: 5 },
        { name: "Custody Services", y: 5 },
        { name: "Insurance", y: 5 },
        { name: "Compliance & Risk Services", y: 5 },
      ],
    },
  ],
};
