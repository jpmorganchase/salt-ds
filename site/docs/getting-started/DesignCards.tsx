import Assets1 from "@site/static/img/design-getting-started/assets1.png";
import Assets2 from "@site/static/img/design-getting-started/assets2.png";
import Assets3 from "@site/static/img/design-getting-started/assets3.png";
import Assets4 from "@site/static/img/design-getting-started/assets4.png";
import SelectIconImg from "@site/static/img/design-getting-started/SelectIconImg.png";

import styles from "./DesignCards.module.css";

const cardInfo = [
  {
    img: Assets1,
    content: (
      <p>
        You can access the components in the left-hand panel using the Assets
        tab.
      </p>
    ),
  },
  {
    img: Assets2,
    content: (
      <p>
        The components are organized in alphabetical order. Select a mode, i.e.
        Light mode, then the component and simply drag it to the Canvas or a
        Frame in your project.
      </p>
    ),
  },
  {
    img: Assets3,
    content: (
      <p>
        Or, if you prefer you can use the search function to find the component
        you need.
      </p>
    ),
  },
  {
    img: Assets4,
    content: (
      <p>
        You can change density and further manipulate the setup in the
        contextual panel on the right-hand side.
      </p>
    ),
  },
];

const DesignCards = () => {
  return (
    <>
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
    </>
  );
};

export const SoloImgCard = () => (
  <div className={styles.soloImg}>
    <Card img={SelectIconImg} />
  </div>
);

const Card = ({ img, content }: { img: string; content?: JSX.Element }) => (
  <div className={styles.card}>
    <div className={styles.imgContainer}>
      <img src={img} />
    </div>
    <div className={styles.textContainer}>{content}</div>
  </div>
);

export default DesignCards;
