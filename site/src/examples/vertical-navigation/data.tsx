import {
  GlobeIcon,
  HandshakeIcon,
  HomeIcon,
  JigsawIcon,
  LightbulbIcon,
} from "@salt-ds/icons";
import type { ReactNode } from "react";

export type Item = {
  title: string;
  href: string;
  icon?: ReactNode;
  status?: string;
  children?: Item[];
};

export const navData: Item[] = [
  {
    title: "Home",
    href: "/",
    status: "New",
    icon: <HomeIcon aria-hidden />,
  },
  {
    title: "Solutions",
    href: "/solutions",
    icon: <JigsawIcon aria-hidden />,
    children: [
      {
        title: "Commercial Banking",
        href: "/solutions/commercial-banking",
        children: [
          {
            title: "Innovation Economy",
            href: "/solutions/commercial-banking/innovation-economy",
          },
          {
            title: "Midsize Businesses",
            href: "/solutions/commercial-banking/midsize-businesses",
          },
          {
            title: "Large Corporations",
            href: "/solutions/commercial-banking/large-corporations",
          },
          {
            title: "Commercial Real Estate",
            href: "/solutions/commercial-banking/commercial-real-estate",
          },
          {
            title: "Community Impact Banking",
            href: "/solutions/commercial-banking/community-impact-banking",
          },
          {
            title: "International Banking",
            href: "/solutions/commercial-banking/international-banking",
          },
        ],
      },
      {
        title: "Credit and Financing",
        href: "/solutions/credit-and-financing",
        children: [
          {
            title: "Asset Based Lending",
            href: "/solutions/credit-and-financing/asset-based-lending",
          },
          {
            title: "Equipment Financing",
            href: "/solutions/credit-and-financing/equipment-financing",
          },
          {
            title: "Trade & Working Capital",
            href: "/solutions/credit-and-financing/trade-working-capital",
          },
          {
            title: "Syndicated Financing",
            href: "/solutions/credit-and-financing/syndicated-financing",
          },
          {
            title: "Commercial Real Estate",
            href: "/solutions/credit-and-financing/commercial-real-estate",
          },
          {
            title: "Employee Stock Ownership Plans",
            href: "/solutions/credit-and-financing/employee-stock-ownership-plans",
          },
        ],
      },
      {
        title: "Institutional Investing",
        href: "/solutions/institutional-investing",
        children: [
          {
            title: "Institutional Investors",
            href: "/solutions/institutional-investing/institutional-investors",
          },
          {
            title: "Markets",
            href: "/solutions/institutional-investing/markets",
          },
          {
            title: "Prime Services",
            href: "/solutions/institutional-investing/prime-services",
          },
          {
            title: "Global Research",
            href: "/solutions/institutional-investing/global-research",
          },
          {
            title: "Securities Services Solutions",
            href: "/solutions/institutional-investing/securities-services-solutions",
          },
        ],
      },
      {
        title: "Investment Banking",
        href: "/solutions/investment-banking",
        children: [
          {
            title: "Center for Carbon Transition",
            href: "/solutions/investment-banking/center-for-carbon-transition",
          },
          {
            title: "Corporate Finance Advisory",
            href: "/solutions/investment-banking/corporate-finance-advisory",
          },
          {
            title: "Development Finance Institution",
            href: "/solutions/investment-banking/development-finance-institution",
          },
          {
            title: "Sustainable Solutions",
            href: "/solutions/investment-banking/sustainable-solutions",
          },
          {
            title: "Mergers and Acquisitions",
            href: "/solutions/investment-banking/mergers-and-acquisitions",
          },
          {
            title: "Capital Markets",
            href: "/solutions/investment-banking/capital-markets",
          },
        ],
      },
      {
        title: "Payments",
        href: "/solutions/payments",
        children: [
          {
            title: "Accept Payments",
            href: "/solutions/payments/accept-payments",
          },
          {
            title: "Process Payments",
            href: "/solutions/payments/process-payments",
          },
          {
            title: "Banking-as-a-service",
            href: "/solutions/payments/banking-as-a-service",
          },
          {
            title: "Manage Funds",
            href: "/solutions/payments/manage-funds",
          },
          {
            title: "Send Payments",
            href: "/solutions/payments/send-payments",
          },
          {
            title: "Explore Blockchain",
            href: "/solutions/payments/explore-blockchain",
          },
          {
            title: "Client Service",
            href: "/solutions/payments/client-service",
          },
          {
            title: "Safeguard Information",
            href: "/solutions/payments/safeguard-information",
          },
        ],
      },
      {
        title: "Private Bank",
        href: "/solutions/private-bank",
        children: [
          {
            title: "Banking",
            href: "/solutions/private-bank/banking",
          },
          {
            title: "Investing",
            href: "/solutions/private-bank/investing",
          },
          {
            title: "Lending",
            href: "/solutions/private-bank/lending",
          },
          {
            title: "Planning",
            href: "/solutions/private-bank/planning",
          },
        ],
      },
      {
        title: "Wealth Management",
        href: "/solutions/wealth-management",
        children: [
          {
            title: "Invest on your own",
            href: "/solutions/wealth-management/invest-on-your-own",
          },
          {
            title: "Work with our advisors",
            href: "/solutions/wealth-management/work-with-our-advisors",
          },
          {
            title: "Expertise for Substantial Wealth",
            href: "/solutions/wealth-management/expertise-for-substantial-wealth",
          },
        ],
      },
    ],
  },
  {
    title: "Who we serve",
    href: "/who-we-serve",
    icon: <HandshakeIcon aria-hidden />,
    children: [
      {
        title: "Financial",
        href: "/who-we-serve/financial",
      },
      {
        title: "Technology",
        href: "/who-we-serve/technology",
      },
    ],
  },
  {
    title: "Insights",
    href: "/insights",
    icon: <LightbulbIcon aria-hidden />,
    children: [
      {
        title: "All Insights",
        href: "/insights/all-insights",
      },
      {
        title: "Insights by Topic",
        href: "/insights/insights-by-topic",
      },
      {
        title: "Insights by Type",
        href: "/insights/insights-by-type",
      },
    ],
  },
  {
    title: "About us",
    href: "/about-us",
    icon: <GlobeIcon aria-hidden />,
    children: [
      {
        title: "Contact Us",
        href: "/about-us/contact-us",
      },
      {
        title: "News and Stories",
        href: "/about-us/news-and-stories",
      },
      {
        title: "Media Center",
        href: "/about-us/media-center",
      },
      {
        title: "Events and Conferences",
        href: "/about-us/events-and-conferences",
      },
      {
        title: "Impact",
        href: "/about-us/impact",
      },
      {
        title: "Technology at Our Firm",
        href: "/about-us/technology-at-our-firm",
      },
    ],
  },
];
