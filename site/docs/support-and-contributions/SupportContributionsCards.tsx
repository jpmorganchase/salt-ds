import {
  DiamondIcon,
  DocumentIcon,
  FlagIcon,
  MessageIcon,
  TearOutIcon,
} from "@jpmorganchase/uitk-icons";

import { GridLayout, GridItem } from "@jpmorganchase/uitk-core";
import Card, { CardProps } from "@site/src/components/card/Card";
import styles from "./SupportContributionsCards.module.css";

const cards: CardProps[] = [
  {
    inlineIcon: <DocumentIcon size={1.7} />,
    title: "Provide feedback",
    description:
      "Join the Salt community on Github to give us feedback and help improve the design system.",
    url: "https://github.com/jpmorganchase/uitk/discussions/categories/feedback",
    footer: {
      footerText: "Share your thoughts on GitHub",
      isExternalLink: true,
    },
    keylineColor: "var(--site-tertiary-accent-orange)",
  },
  {
    inlineIcon: <FlagIcon size={1.7} />,
    title: "Raise a bug",
    description:
      "Let us know if you spot any issues with our components and we'll add them to our backlog.",
    url: "https://github.com/jpmorganchase/uitk/issues/new?assignees=&labels=type%3A+bug+%F0%9F%AA%B2%2Cstatus%3A+awaiting+triage&template=bug_report.yml",
    footer: { footerText: "Report a bug on GitHub", isExternalLink: true },
    keylineColor: "var(--site-tertiary-accent-purple)",
  },
  {
    inlineIcon: <DiamondIcon size={1.7} />,
    title: "Request a feature",
    description:
      "If your team needs a feature or functionality that’s not currently provided, we may be able to assist.",
    url: "https://github.com/jpmorganchase/uitk/issues/new?assignees=&labels=type%3A+enhancement+%F0%9F%92%A1%2Cstatus%3A+awaiting+triage&template=feature_request.yml",
    footer: { footerText: "Ask on GitHub", isExternalLink: true },
    keylineColor: "var(--site-tertiary-accent-teal)",
  },
  {
    inlineIcon: <MessageIcon size={1.7} />,
    title: "Contact us directly",
    description:
      "Email us if you have a complex product or design-related query and we’ll do our best to help.",
    url: "mailto:salt.design.system@jpmorgan.com",
    footer: { footerText: "Send us an email" },
    keylineColor: "var(--site-tertiary-accent-green)",
  },
];

const SupportContributionsCards = () => (
  <div className={styles.supportContributionsCards}>
    <GridLayout
      columns={{
        lg: 3,
        md: 2,
        sm: 1,
        xl: 3,
        xs: 1,
      }}
      gap={3}
      rows={2}
    >
      {cards.map((card) => {
        return (
          <GridItem>
            <Card {...card} key={card.title} keyLineAnimation={false} />
          </GridItem>
        );
      })}
    </GridLayout>
  </div>
);

export default SupportContributionsCards;
