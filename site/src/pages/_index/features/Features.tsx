import { ComponentPropsWithoutRef } from "react";
import { SuccessIcon } from "@salt-ds/icons";
import useSplitArray from "@site/src/utils/useSplitArray";
import styles from "./Features.module.css";

export interface FeaturesProps extends ComponentPropsWithoutRef<"div"> {
  heading: string;
  listItems: string[];
}

type ListItemProps = { item: string };

const ListItem = ({ item }: ListItemProps) => (
  <li className={styles.listItem}>
    <SuccessIcon size={1} />
    {item}
  </li>
);

const Features = ({ heading, listItems }: FeaturesProps): JSX.Element => {
  const [firstHalf, secondHalf] = useSplitArray(listItems);

  return (
    <div className={styles.featuresContainerWrapper}>
      <div className={styles.featuresContainer}>
        <h2>{heading}</h2>
        <ul className={styles.listItems}>
          {firstHalf.map((item, index) => (
            <ListItem key={index} item={item} />
          ))}
        </ul>
        <ul className={styles.listItems}>
          {secondHalf.map((item, index) => (
            <ListItem key={index} item={item} />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Features;
