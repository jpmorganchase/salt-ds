import { Button, FlowLayout } from "@salt-ds/core";

export const Sentiment = () => {
  return (
    <FlowLayout>
      <Button sentiment="neutral">Neutral</Button>
      <Button sentiment="accented">Accented</Button>
      <Button sentiment="caution">Caution</Button>
      <Button sentiment="negative">Negative</Button>
      <Button sentiment="positive">Positive</Button>
    </FlowLayout>
  );
};
