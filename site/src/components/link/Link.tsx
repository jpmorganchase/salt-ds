import DocusaurusLink from "@docusaurus/Link";
export default function Link(props) {
  return <DocusaurusLink {...props} target="_self" />; // all links should open in the same tab for usability and accessibility purposes
}
