import Card, { CardProps } from "@site/src/components/card/Card";
import DesignIcon from "@site/static/img/design.svg";
import DevelopIcon from "@site/static/img/develop.svg";
import { ToolkitProvider, useTheme } from "@salt-ds/core";
import styles from "./OverviewCards.module.css";

const cards: CardProps[] = [
  {
    icon: <DesignIcon />,
    title: "Designing",
    description:
      "Find out how to access Salt’s comprehensive libraries in Figma, add components and apply styling to your designs.",
    url: "/getting-started/designing",
    footer: { footerText: "Start designing" },
    keylineColor: "var(--site-tertiary-accent-purple)",
  },
  {
    icon: <DevelopIcon />,
    title: "Developing",
    description:
      "Learn how to install the Salt packages, integrate them into your React project, add the web fonts you need and import components.",
    url: "/getting-started/developing",
    footer: { footerText: "Start developing" },
    keylineColor: "var(--site-tertiary-accent-orange)",
  },
];

const OverviewCards = () => (
  <div className={styles.overviewCards}>
    {cards.map((card, index) => {
      const { icon, title, description, url, footer, keylineColor } = card;
      return (
        <ToolkitProvider mode="light" key={index}>
          <Card
            icon={icon}
            title={title}
            description={description}
            url={url}
            footer={footer}
            keylineColor={keylineColor}
            keyLineAnimation={false}
          />
        </ToolkitProvider>
      );
    })}
  </div>
);

export default OverviewCards;
