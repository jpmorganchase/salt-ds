import Link from "@docusaurus/Link";
import FigmaLogo from "@site/static/img/figma_logo.svg";
import styles from "./FigmaLink.module.css";

const FigmaLink = () => (
  <Link className={styles.link}>
    <FigmaLogo className={styles.logo} />
    View in Figma
  </Link>
);

export default FigmaLink;
