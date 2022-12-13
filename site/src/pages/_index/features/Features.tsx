import { ComponentPropsWithoutRef, useMemo } from "react";
import { SuccessIcon } from "@jpmorganchase/uitk-icons";
import styles from "./Features.module.css";

export interface FeaturesProps extends ComponentPropsWithoutRef<"div"> {
  heading: string;
  listItems: string[];
}

const splitListItems = (listItems: string[]) => {
  const listItemsHalf = Math.ceil(listItems.length / 2);

  const firstHalf = listItems.slice(0, listItemsHalf);
  const secondHalf = listItems.slice(listItemsHalf);

  return [firstHalf, secondHalf];
};

type ListItemProps = { item: string };

const ListItem = ({ item }: ListItemProps) => (
  <li className={styles.listItem}>
    <SuccessIcon size={1} />
    {item}
  </li>
);

const Features = ({ heading, listItems }: FeaturesProps): JSX.Element => {
  const [firstHalf, secondHalf] = useMemo(
    () => splitListItems(listItems),
    [listItems]
  );

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
