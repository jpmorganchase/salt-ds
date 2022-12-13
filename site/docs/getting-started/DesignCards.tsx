import Assets1 from "./DesignCardImages/Asset1";
import Assets2 from "./DesignCardImages/Asset2";
import Assets3 from "./DesignCardImages/Asset3";
import Assets4 from "./DesignCardImages/Asset4";
import SelectIconImg from "@site/static/img/design-getting-started/SelectIconImg.png";

import styles from "./DesignCards.module.css";

type CardInfoType = {
  img: JSX.Element;
  content?: JSX.Element;
};

const cardInfo: CardInfoType[] = [
  {
    img: <Assets1 />,
    content: (
      <p>
        Use the “Assets” tab In the left-hand panel to access the components,
        which are organized in alphabetical order.
      </p>
    ),
  },
  {
    img: <Assets2 />,
    content: (
      <p>
        Select a mode, choose the component you need and simply drag it to the
        Canvas or a Frame in your project.
      </p>
    ),
  },
  {
    img: <Assets3 />,
    content: (
      <p>
        Or, if you prefer, you can use the search function to find the component
        you need.
      </p>
    ),
  },
  {
    img: <Assets4 />,
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
        {cardInfo.slice(0, 2).map((cardInfo, index) => (
          <Card {...cardInfo} key={index} />
        ))}
      </div>
      <div className={styles.row}>
        {cardInfo.slice(2, 4).map((cardInfo, index) => (
          <Card {...cardInfo} key={index} />
        ))}
      </div>
    </div>
  );
};

export const SoloImgCard = () => (
  <div className={styles.card}>
    <img
      src={SelectIconImg}
      alt="Screenshot of Figma's swap instance menu displaying a list of Salt icons"
    />
    <div className={styles.textContainer}>
      <p>Swapping an icon in Figma</p>
    </div>
  </div>
);

const Card = ({ img, content }: CardInfoType) => (
  <div className={styles.card}>
    {img}
    <div className={styles.textContainer}>{content}</div>
  </div>
);

export default DesignCards;
