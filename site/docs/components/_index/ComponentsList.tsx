import { useState } from "react";
import {
  componentDetails,
  ComponentStatus,
  ComponentDetails,
} from "./components-list";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import {
  TearOutIcon,
  StepActiveIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@jpmorganchase/uitk-icons";
import StorybookLogo from "@site/static/img/storybook_logo.svg";
import ReactLogo from "@site/static/img/react_logo.svg";
import FigmaLogo from "@site/static/img/figma_logo.svg";

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

const componentsListSortedByName = (ascendingOrder: boolean = true) =>
  [...componentDetails].sort(
    (a, b) => a.name.localeCompare(b.name) * (ascendingOrder ? 1 : -1)
  );

type SortedByStatus = "devStatus" | "designStatus";

const componentsListSortedByStatus = (
  componentStatus: SortedByStatus,
  ascendingOrder: boolean = true
) =>
  componentsListSortedByName().sort(
    (a, b) =>
      (statusSortList.indexOf(a[componentStatus]) -
        statusSortList.indexOf(b[componentStatus])) *
      (ascendingOrder ? 1 : -1)
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

  return (
    <div className={clsx(styles.status, styles[statusClass(status)])}>
      <StepActiveIcon />
      <span>{showReleaseDate ? `Released in v${availableSince}` : status}</span>
    </div>
  );
};

const ComponentHeader = ({
  logo,
  label,
  isSorted,
  ascendingOrder,
}: {
  logo: JSX.Element;
  label: string;
  isSorted: boolean;
  ascendingOrder: boolean;
}) => {
  const arrowIcon = ascendingOrder ? <ArrowUpIcon /> : <ArrowDownIcon />;
  return (
    <div className={styles.headerContainer}>
      <div>
        {logo}
        <span>{label}</span>
      </div>
      {isSorted && arrowIcon}
    </div>
  );
};

type SortedBy = SortedByStatus | "name";

const ComponentsList = () => {
  const [componentsList, setComponentsList] = useState(
    componentsListSortedByStatus("devStatus", true)
  );

  const [isSortedBy, setIsSortedBy] = useState<SortedBy>("devStatus");

  const [hasAscendingOrder, setHasAscendingOrder] = useState(true);

  const handleNameSorting = () => {
    setIsSortedBy("name");
    setHasAscendingOrder((hasAscendingOrder) => !hasAscendingOrder);
    setComponentsList(componentsListSortedByName(!hasAscendingOrder));
  };

  const handleStatusSorting = (componentStatus: SortedByStatus) => {
    setIsSortedBy(componentStatus);
    setHasAscendingOrder((hasAscendingOrder) => !hasAscendingOrder);
    setComponentsList(
      componentsListSortedByStatus(componentStatus, !hasAscendingOrder)
    );
  };

  return (
    <div className={styles.componentList}>
      <table>
        <thead>
          <tr>
            <th onClick={handleNameSorting}>
              <ComponentHeader
                logo={<StorybookLogo />}
                label="Component"
                isSorted={isSortedBy === "name"}
                ascendingOrder={hasAscendingOrder}
              />
            </th>
            <th onClick={() => handleStatusSorting("devStatus")}>
              <ComponentHeader
                logo={<ReactLogo />}
                label="React"
                isSorted={isSortedBy === "devStatus"}
                ascendingOrder={hasAscendingOrder}
              />
            </th>
            <th onClick={() => handleStatusSorting("designStatus")}>
              <ComponentHeader
                logo={<FigmaLogo />}
                label="Figma"
                isSorted={isSortedBy === "designStatus"}
                ascendingOrder={hasAscendingOrder}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {componentsList.map((component, index) => {
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
