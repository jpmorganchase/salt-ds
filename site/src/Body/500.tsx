import { Card, Text } from "@salt-ds/core";
import styles from "./ErrorPage.module.css";

export function Page500() {
  return (
    <div className={styles.root}>
      <Card className={styles.card}>
        <Text styleAs="display4">500 - Critical Error</Text>
        <div className={styles.content}>
          <Text>
            The server encountered an error and was unable to complete your
            request.
          </Text>
          <Text>Please try again later.</Text>
        </div>
      </Card>
    </div>
  );
}
