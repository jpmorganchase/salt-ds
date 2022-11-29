import Card, { CardProps } from "@site/src/components/card/Card";
import DesignIcon from "@site/static/img/design.svg";
import DevelopIcon from "@site/static/img/develop.svg";
import styles from "./OverviewCards.module.css";

const cards: CardProps[] = [
  {
    icon: <DesignIcon />,
    title: "Design",
    description:
      "Find out how to access Salt’s comprehensive libraries in Figma, add components and apply styling to your designs.",
    url: "/getting-started/design",
    linkText: "Start designing",
    keylineColor: "var(--uitk-color-purple-500)",
  },
  {
    icon: <DevelopIcon />,
    title: "Develop",
    description:
      "We walk you through the process of installing the Salt dependencies into your React project and importing components.",
    url: "/getting-started/dev",
    linkText: "Start developing",
    keylineColor: "var(--uitk-color-orange-600)",
  },
];

const OverviewCards = () => (
  <div className={styles.overviewCards}>
    {cards.map((card, index) => {
      const { icon, title, description, url, linkText, keylineColor } = card;
      return (
        <Card
          key={index}
          theme="light"
          icon={icon}
          title={title}
          description={description}
          url={url}
          linkText={linkText}
          keylineColor={keylineColor}
        />
      );
    })}
  </div>
);

export default OverviewCards;
