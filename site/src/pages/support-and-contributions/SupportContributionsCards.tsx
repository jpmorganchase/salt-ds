import {
  DiamondIcon,
  DocumentIcon,
  FlagIcon,
  MessageIcon,
  TearOutIcon,
} from "@jpmorganchase/uitk-icons";
import Card, { CardProps } from "@site/src/components/card/Card";
import styles from "./SupportContributionsCards.module.css";

const cards: CardProps[] = [
  {
    inlineIcon: <DocumentIcon size={1.5} />,
    title: "Provide feedback",
    description:
      "Join the Salt community on Github to give us feedback and help improve the design system.",
    url: "https://github.com/jpmorganchase/uitk",
    footer: (
      <span>
        Share your thoughts on GitHub <TearOutIcon />
      </span>
    ),
    keylineColor: "var(--site-tertiary-accent-orange)",
  },
  {
    inlineIcon: <FlagIcon size={1.5} />,
    title: "Raise a bug",
    description:
      "Let us know if you spot any issues and we’ll add them to our backlog.",
    url: "https://github.com/jpmorganchase/uitk",
    footer: (
      <span>
        Report a bug on GitHub <TearOutIcon />
      </span>
    ),
    keylineColor: "var(--site-tertiary-accent-purple)",
  },
  {
    inlineIcon: <DiamondIcon size={1.5} />,
    title: "Request a feature",
    description:
      "If your team needs a feature or functionality that’s not currently provided, we may be able to assist.",
    url: "https://github.com/jpmorganchase/uitk",
    footer: (
      <span>
        Ask on GitHub <TearOutIcon />
      </span>
    ),
    keylineColor: "var(--site-tertiary-accent-teal)",
  },
  {
    inlineIcon: <MessageIcon size={1.5} />,
    title: "Contact us directly",
    description:
      "Email us if you have a complex product or design-related query and we’ll do our best to help.",
    url: "mailto:example@example.com",
    footer: "Send us an email",
    keylineColor: "var(--site-tertiary-accent-green)",
  },
];

const SupportContributionsCards = () => (
  <div className={styles.supportContributionsCards}>
    {cards.map((card) => {
      return <Card {...card} key={card.title} keyLineAnimation={false} />;
    })}
  </div>
);

export default SupportContributionsCards;
