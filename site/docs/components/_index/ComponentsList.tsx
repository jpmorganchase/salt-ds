import {
  componentDetails,
  ComponentStatus,
  ComponentDetails,
} from "./components-list";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import { TearOutIcon, StepActiveIcon } from "@jpmorganchase/uitk-icons";
import StorybookLogo from "@site/static/img/storybook_logo.svg";
import ReactLogo from "@site/static/img/react_logo.svg";
import FigmaLogo from "@site/static/img/figma_logo.svg";
import useIsMobileView from "../../../src/utils/useIsMobileView";

import styles from "./ComponentsList.module.css";

const statusClass = (status: ComponentStatus) => {
  if (status === ComponentStatus.READY) {
    return "ready";
  }
  if (status === ComponentStatus.IN_PROGRESS) {
    return "progress";
  }

  return "backlog";
};

const statusSortList = [
  ComponentStatus.READY,
  ComponentStatus.IN_PROGRESS,
  ComponentStatus.IN_BACKLOG,
];

const componentsListSortedByStatus = [...componentDetails].sort(
  (a, b) =>
    statusSortList.indexOf(a.devStatus) - statusSortList.indexOf(b.devStatus)
);

const ComponentNameData = ({ component }: { component: ComponentDetails }) => {
  const { devStatus, name, storybookUrl } = component;

  return devStatus === ComponentStatus.READY ? (
    <Link to={storybookUrl}>
      <span>{name}</span> <TearOutIcon />
    </Link>
  ) : (
    <span>{name}</span>
  );
};

const ComponentStatusData = ({
  status,
  availableSince,
}: {
  status: ComponentStatus;
  availableSince: string;
}) => {
  const showReleaseDate = availableSince && status === ComponentStatus.READY;
  const isMobileView = useIsMobileView();
  const mobileView = (
    <span>{showReleaseDate ? `v${availableSince}` : null}</span>
  );

  return (
    <div className={clsx(styles.status, styles[statusClass(status)])}>
      <StepActiveIcon />
      {isMobileView ? (
        mobileView
      ) : (
        <span>
          {showReleaseDate ? `Released in v${availableSince}` : status}
        </span>
      )}
    </div>
  );
};

const ComponentsList = () => {
  const isMobileView = useIsMobileView();
  return (
    <div className={styles.componentList}>
      <table>
        <thead>
          <tr>
            <th>
              <StorybookLogo />
              {!isMobileView && <span>Component</span>}
            </th>
            <th>
              <ReactLogo />
              {!isMobileView && <span>React</span>}
            </th>
            <th>
              <FigmaLogo />
              {!isMobileView && <span>Figma</span>}
            </th>
          </tr>
        </thead>
        <tbody>
          {componentsListSortedByStatus.map((component, index) => {
            return (
              <tr key={index}>
                <td>
                  <ComponentNameData component={component} />
                </td>
                <td>
                  <ComponentStatusData
                    status={component.devStatus}
                    availableSince={component.availableInCoreSince}
                  />
                </td>

                <td>
                  <ComponentStatusData
                    status={component.designStatus}
                    availableSince={component.availableInFigmaSince}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ComponentsList;
