import Assets1 from "@site/static/img/design-getting-started/assets1.png";
import Assets2 from "@site/static/img/design-getting-started/assets2.png";
import Assets3 from "@site/static/img/design-getting-started/assets3.png";
import Assets4 from "@site/static/img/design-getting-started/assets4.png";
import SelectIconImg from "@site/static/img/design-getting-started/SelectIconImg.png";

import styles from "./DesignCards.module.css";

type CardInfoType = { img: string; altText: string; content?: JSX.Element };

const cardInfo: CardInfoType[] = [
  {
    img: Assets1,
    altText:
      'Screenshot of Figma\'s assets panel displaying the "Salt: Components Light" library',
    content: (
      <p>
        You can access the components in the left-hand panel using the “Assets”
        tab. Click on the book icon and search for “Salt” in Libraries.
      </p>
    ),
  },
  {
    img: Assets2,
    altText:
      "Screenshot of a light mode Button compponent being dragged out of Figma's assets panel",
    content: (
      <p>
        Switch on the library you need, for example, Components (Light or Dark),
        Mode, Theme Palette, Typography, Icons, Layout Grid, etc.
      </p>
    ),
  },
  {
    img: Assets3,
    altText:
      "Screenshot of the word 'button' being searched for in the Figma assets panel and Salt components with matching names being displayed",
    content: (
      <p>
        Use the search function to find the component you need and then drag it
        to your canvas to use it.
      </p>
    ),
  },
  {
    img: Assets4,
    altText:
      "Screenshot of the Figma's contextual panel for Salt's Button component",
    content: (
      <p>
        To change density and further manipulate the setup, use the contextual
        panel on the right-hand side.
      </p>
    ),
  },
];

const DesignCards = () => {
  return (
    <div className={styles.designCardsContainer}>
      <div className={styles.row}>
        {cardInfo.slice(0, 2).map((cardInfo) => (
          <Card {...cardInfo} key={cardInfo.img} />
        ))}
      </div>
      <div className={styles.row}>
        {cardInfo.slice(2, 4).map((cardInfo) => (
          <Card {...cardInfo} key={cardInfo.img} />
        ))}
      </div>
    </div>
  );
};

export const SoloImgCard = () => (
  <Card
    img={SelectIconImg}
    content={<p>Swapping an icon in Figma</p>}
    altText="Screenshot of Figma's swap instance menu displaying a list of Salt icons"
  />
);

const Card = ({ img, altText, content }: CardInfoType) => (
  <div className={styles.card}>
    <img src={img} alt={altText} />
    <div className={styles.textContainer}>{content}</div>
  </div>
);

export default DesignCards;
