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
        Use the “Assets” tab In the left-hand panel to access the components,
        which are organized in alphabetical order.
      </p>
    ),
  },
  {
    img: Assets2,
    altText:
      "Screenshot of a light mode Button compponent being dragged out of Figma's assets panel",
    content: (
      <p>
        Select a mode, choose the component you need and simply drag it to the
        Canvas or a Frame in your project.
      </p>
    ),
  },
  {
    img: Assets3,
    altText:
      "Screenshot of the word 'button' being searched for in the Figma assets panel and Salt components with matching names being displayed",
    content: (
      <p>
        Or, if you prefer, you can use the search function to find the component
        you need.
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
