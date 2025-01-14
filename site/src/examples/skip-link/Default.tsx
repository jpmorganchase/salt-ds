import {
  BorderItem,
  BorderLayout,
  Button,
  FlexItem,
  FlexLayout,
  H2,
  H3,
  H4,
  NavigationItem,
  SplitLayout,
  StackLayout,
} from "@salt-ds/core";
import { ChevronRightIcon, GithubIcon } from "@salt-ds/icons";
import { SkipLink } from "@salt-ds/lab";
import type { ReactElement } from "react";
import { useState } from "react";
import styles from "./Default.module.css";

export const Default = (): ReactElement => {
  const headerItems = ["Glossary", "Components", "Patterns"];

  const [activeHeaderNav, setActiveHeaderNav] = useState(headerItems[0]);
  return (
    <BorderLayout className={styles.container}>
      <BorderItem position="north" as="header">
        <SkipLink targetId="main">Skip to main content</SkipLink>
        <FlexLayout className={styles.header} justify="space-between" gap={3}>
          <FlexItem align="center">
            <H4>LOGO</H4>
          </FlexItem>
          <nav>
            <ul className={styles.navigation}>
              {headerItems?.map((item) => (
                <li key={item}>
                  <NavigationItem
                    active={activeHeaderNav === item}
                    href="#"
                    onClick={(event) => {
                      // prevent default to avoid navigation in example
                      event.preventDefault();
                      setActiveHeaderNav(item);
                    }}
                  >
                    {item}
                  </NavigationItem>
                </li>
              ))}
            </ul>
          </nav>
          <FlexItem align="center">
            <StackLayout direction="row" gap={1}>
              <Button appearance="transparent">
                <GithubIcon />
              </Button>
            </StackLayout>
          </FlexItem>
        </FlexLayout>
      </BorderItem>
      <BorderItem position="center" className={styles.center}>
        <StackLayout as="article">
          <section>
            <H2 styleAs="h1" id="main" className={styles.contentHeader}>
              Glossary
            </H2>
            <H3>Characteristics</H3>
            <p>
              A Salt characteristic refers to a design token that aligns with a
              holistic semantic used throughout the design language.
            </p>
            <H3>Components</H3>
            <p>
              Salt components serve as foundational building blocks as well as
              representing design primitives. Users of Salt can design and
              implement their own patterns within their own scope. For a full
              list of foundational components, refer to the component
              documentation.
            </p>
          </section>
          <SplitLayout
            endItem={
              <Button appearance="transparent">
                see all glossary terms <ChevronRightIcon aria-hidden />
              </Button>
            }
          />
        </StackLayout>
      </BorderItem>
    </BorderLayout>
  );
};
