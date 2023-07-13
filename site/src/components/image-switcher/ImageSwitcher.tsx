import styles from "./ImageSwitcher.module.css";
import { Switch } from "@salt-ds/lab";
import { useState } from "react";
import { Image } from "@jpmorganchase/mosaic-site-components";

export interface ImageSwitcherProps {
  label: string;
  images: Array<{ alt: string; src: string }>;
}

export function ImageSwitcher(props: ImageSwitcherProps): JSX.Element {
  const { label, images } = props;
  const [toggle, setToggle] = useState(false);

  const handleToggle = () => {
    setToggle((old) => !old);
  };

  const currentImage = toggle ? images[1] : images[0];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Switch
          className={styles.switch}
          checked={toggle}
          onChange={handleToggle}
          label={label}
        />
      </div>
      {currentImage && (
        <Image
          className={styles.image}
          alt={currentImage?.alt}
          src={currentImage?.src}
        />
      )}
    </div>
  );
}
