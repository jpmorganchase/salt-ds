import { useColorMode } from "@jpmorganchase/mosaic-store";
import { SaltProviderNext, Switch } from "@salt-ds/core";
import { type ChangeEvent, useState } from "react";
import { Image } from "../mdx/image";
import styles from "./ImageSwitcher.module.css";

export interface ImageSwitcherProps {
  label: string;
  caption?: string;
  images: Array<{ alt: string; src: string }>;
  darkImages: Array<{ alt: string; src: string }>;
}

export function ImageSwitcher(props: ImageSwitcherProps): JSX.Element {
  const { darkImages, label, images, caption } = props;
  const [toggle, setToggle] = useState(false);
  const siteMode = useColorMode();

  const imagesToUse = siteMode === "dark" && darkImages ? darkImages : images;

  const handleToggle = (event: ChangeEvent<HTMLInputElement>) => {
    setToggle(event.target.checked);
  };

  const currentImage = toggle ? imagesToUse[1] : imagesToUse[0];
  const mode = siteMode === "dark" && darkImages ? "dark" : "light";

  return (
    <SaltProviderNext mode={mode} applyClassesTo="child">
      <figure className={styles.figure}>
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
        {caption && (
          <figcaption className={styles.caption}>{caption}</figcaption>
        )}
      </figure>
    </SaltProviderNext>
  );
}
