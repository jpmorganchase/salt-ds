import { useStore } from "@jpmorganchase/mosaic-store";
import { Card, Text } from "@salt-ds/core";
import { CTALink } from "../components/cta-link/CTALink";
import styles from "./ErrorPage.module.css";

export function Page404() {
  const homeLink = useStore((store) => store.sharedConfig?.header?.homeLink);
  return (
    <div className={styles.root}>
      <Card className={styles.card}>
        <Text styleAs="display4">404 - Page Not Found</Text>
        <div className={styles.content}>
          <Text>
            The page you are looking for doesn't exist or has been moved.
          </Text>
          <Text>Please check the URL or navigate back to the home page.</Text>
        </div>
        <CTALink href={homeLink || "/"} sentiment="neutral">
          Return to home
        </CTALink>
      </Card>
    </div>
  );
}
