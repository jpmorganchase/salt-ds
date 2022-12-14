import Card, { CardProps } from "@site/src/components/card/Card";
import DesignIcon from "@site/static/img/design.svg";
import DevelopIcon from "@site/static/img/develop.svg";
import { ToolkitProvider, useTheme } from "@jpmorganchase/uitk-core";
import styles from "./OverviewCards.module.css";

const cards: CardProps[] = [
  {
    icon: <DesignIcon />,
    title: "Designing",
    description: (
      <p>
        Find out how to access Salt’s comprehensive libraries in Figma, add
        components and apply styling to your designs.
      </p>
    ),
    url: "/getting-started/designing",
    footerText: "Start designing",
    keylineColor: "var(--site-tertiary-accent-purple)",
  },
  {
    icon: <DevelopIcon />,
    title: "Developing",
    description: (
      <p>
        Learn how to install the Salt packages, integrate them into your React
        project, add the web fonts you need and import components.
      </p>
    ),
    url: "/getting-started/developing",
    footerText: "Start developing",
    keylineColor: "var(--site-tertiary-accent-orange)",
  },
];

const OverviewCards = () => (
  <div className={styles.overviewCards}>
    {cards.map((card, index) => {
      const { icon, title, description, url, footerText, keylineColor } = card;
      return (
        <ToolkitProvider mode="light" key={index}>
          <Card
            icon={icon}
            title={title}
            description={description}
            url={url}
            footerText={footerText}
            keylineColor={keylineColor}
            keyLineAnimation={false}
          />
        </ToolkitProvider>
      );
    })}
  </div>
);

export default OverviewCards;
