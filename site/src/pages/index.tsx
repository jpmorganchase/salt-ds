import { useRef } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import { Button } from "@jpmorganchase/uitk-core";
import Card, { CardProps } from "../components/Card";
import useOnScreen from "../utils/useOnScreen";

import styles from "./index.module.css";

function HomepageHeader() {
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">Build & grow</h1>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <div className={styles.buttons}>
          <Link to="/getting-started">
            <Button variant="cta">Getting Started</Button>
          </Link>
          <Link to="/components">
            <Button variant="cta">Components</Button>
          </Link>
          <Link to="/contributing">
            <Button variant="cta">Contributing</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

const placeholderDescription =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

const cards: CardProps[] = [
  {
    icon: "pencil",
    title: "Start Designing",
    description: placeholderDescription,
  },
  {
    icon: "code",
    title: "Start Developing",
    description: placeholderDescription,
  },
  {
    icon: "arrows",
    title: "Make a contribution",
    description: placeholderDescription,
  },
];

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  const ref = useRef<HTMLDivElement>();

  const onScreen: boolean = useOnScreen<HTMLDivElement>(ref, "-200px");

  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <HomepageHeader />
      <div className={styles.cardContainer}>
        {cards.map((card, index) => {
          const { icon, title, description } = card;
          return (
            <Card
              key={index}
              icon={icon}
              title={title}
              description={description}
            />
          );
        })}
      </div>
      <div className={clsx("container", styles.storyContainer)}>
        <div
          className={clsx(styles.keyline, { [styles.animate]: onScreen })}
          ref={ref}
        ></div>
        <h1 className={styles.storyHeader}>The Odyssey story</h1>
        <p>
          Nulla pariatur esse proident sunt aliqua sunt. Est ullamco minim velit
          consequat aliquip tempor. Sunt veniam fugiat cillum consequat
          voluptate velit id ipsum dolore tempor laborum deserunt. Ex
          consectetur consequat tempor velit incididunt tempor et incididunt. Ea
          cillum nulla sit amet labore officia est id reprehenderit mollit
          laboris. Incididunt proident id cillum veniam minim aliqua officia
          aute magna cillum Lorem. Adipisicing quis in occaecat sunt laborum.
          Nostrud ut duis cupidatat in officia. Lorem esse consectetur culpa
          laborum sit id. Ad voluptate non deserunt anim Lorem ex ut Lorem.
          Fugiat elit nisi qui ipsum id. Elit eiusmod do ipsum amet consequat id
          ut dolore ut fugiat pariatur irure non. Amet ipsum minim aliquip
          aliquip incididunt magna quis ad consequat magna aliquip. Mollit
          voluptate ea ad magna do elit adipisicing do. Proident sit veniam quis
          enim ut voluptate adipisicing sit enim qui exercitation. Ad labore
          dolore consequat elit velit non. Ullamco sit officia consequat officia
          sint fugiat proident eiusmod laborum exercitation elit irure cillum
          duis.
        </p>
        <p>
          Nulla pariatur esse proident sunt aliqua sunt. Est ullamco minim velit
          consequat aliquip tempor. Sunt veniam fugiat cillum consequat
          voluptate velit id ipsum dolore tempor laborum deserunt. Ex
          consectetur consequat tempor velit incididunt tempor et incididunt. Ea
          cillum nulla sit amet labore officia est id reprehenderit mollit
          laboris. Incididunt proident id cillum veniam minim aliqua officia
          aute magna cillum Lorem. Adipisicing quis in occaecat sunt laborum.
          Nostrud ut duis cupidatat in officia. Lorem esse consectetur culpa
          laborum sit id. Ad voluptate non deserunt anim Lorem ex ut Lorem.
          Fugiat elit nisi qui ipsum id. Elit eiusmod do ipsum amet consequat id
          ut dolore ut fugiat pariatur irure non. Amet ipsum minim aliquip
          aliquip incididunt magna quis ad consequat magna aliquip. Mollit
          voluptate ea ad magna do elit adipisicing do. Proident sit veniam quis
          enim ut voluptate adipisicing sit enim qui exercitation. Ad labore
          dolore consequat elit velit non. Ullamco sit officia consequat officia
          sint fugiat proident eiusmod laborum exercitation elit irure cillum
          duis.
        </p>

        <Link to="/components">
          <Button variant="cta">See components</Button>
        </Link>
      </div>
    </Layout>
  );
}
