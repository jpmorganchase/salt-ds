import { useState } from "react";
import {
  componentDetails,
  ComponentStatus,
  ComponentDetails,
} from "./components-list";
import clsx from "clsx";
import Link from "@site/src/components/link/Link";
import { StepActiveIcon, ArrowUpIcon, ArrowDownIcon } from "@salt-ds/icons";
import { Button } from "@salt-ds/core";
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
  if (status === ComponentStatus.IN_BACKLOG) {
    return "backlog";
  }
  return "none";
};

const statusSortList = [
  ComponentStatus.READY,
  ComponentStatus.IN_PROGRESS,
  ComponentStatus.IN_BACKLOG,
  ComponentStatus.NOT_APPLICABLE,
];

const componentsListSortedByName = (ascendingOrder: boolean = true) =>
  [...componentDetails].sort(
    (a, b) => a.name.localeCompare(b.name) * (ascendingOrder ? 1 : -1)
  );

type SortedBy = "devStatus" | "designStatus" | "name";

const componentsListSorting = (
  componentDetail: SortedBy,
  ascendingOrder: boolean = true
) => {
  if (componentDetail === "name") {
    return componentsListSortedByName(ascendingOrder);
  }

  return componentsListSortedByName().sort((a, b) => {
    const orderMultiplier = ascendingOrder ? 1 : -1;
    const statusDiff =
      (statusSortList.indexOf(a[componentDetail]) -
        statusSortList.indexOf(b[componentDetail])) *
      orderMultiplier;
    if (statusDiff === 0 && componentDetail === "devStatus") {
      if (a.availableInCoreSince && b.availableInCoreSince) {
        return (
          a.availableInCoreSince.localeCompare(b.availableInCoreSince) *
          orderMultiplier
        );
      } else if (a.availableInCoreSince) {
        return orderMultiplier;
      } else if (b.availableInCoreSince) {
        return -1 * orderMultiplier;
      } else {
        return 0;
      }
    } else {
      return statusDiff;
    }
  });
};

const ComponentNameData = ({ component }: { component: ComponentDetails }) => {
  const { devStatus, name, storybookUrl } = component;

  return devStatus === ComponentStatus.READY ? (
    <Link to={storybookUrl}>
      <span>{name}</span>
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

  const activeStatus = status !== ComponentStatus.NOT_APPLICABLE;

  return (
    <div className={clsx(styles.status, styles[statusClass(status)])}>
      {activeStatus ? <StepActiveIcon /> : null}
      {isMobileView && activeStatus ? (
        mobileView
      ) : (
        <span>
          {showReleaseDate ? `Released in v${availableSince}` : status}
        </span>
      )}
    </div>
  );
};

type ComponentHeaderProps = {
  logo: JSX.Element;
  label: string;
  isSorted: boolean;
  ascendingOrder: boolean;
  handleClick: () => void;
};

const ComponentHeader = ({
  logo,
  label,
  isSorted,
  ascendingOrder,
  handleClick,
}: ComponentHeaderProps) => {
  const isMobileView = useIsMobileView();
  const arrowIcon = ascendingOrder ? <ArrowUpIcon /> : <ArrowDownIcon />;
  return (
    <Button onClick={handleClick}>
      <span className={styles.headerContainer}>
        <span>
          {logo}
          {!isMobileView && <span>{label}</span>}
        </span>
        {isSorted && arrowIcon}
      </span>
    </Button>
  );
};

const ComponentsList = () => {
  const [componentsList, setComponentsList] = useState(
    componentsListSorting("devStatus", true)
  );

  const [isSortedBy, setIsSortedBy] = useState<SortedBy>("devStatus");

  const [hasAscendingOrder, setHasAscendingOrder] = useState(true);

  const handleSorting = (componentDetail: SortedBy) => {
    setIsSortedBy(componentDetail);

    if (componentDetail === isSortedBy) {
      setHasAscendingOrder((hasAscendingOrder) => !hasAscendingOrder);
      setComponentsList(
        componentsListSorting(componentDetail, !hasAscendingOrder)
      );
    } else {
      // we want to reset the sorting order when switching to a different column
      setHasAscendingOrder(true);
      setComponentsList(componentsListSorting(componentDetail, true));
    }
  };

  const ariaSort = hasAscendingOrder ? "ascending" : "descending";

  return (
    <div className={styles.componentList}>
      <table>
        <thead>
          <tr>
            <th aria-sort={isSortedBy === "name" ? ariaSort : null}>
              <ComponentHeader
                logo={<StorybookLogo role="presentation" />}
                label="Component"
                isSorted={isSortedBy === "name"}
                ascendingOrder={hasAscendingOrder}
                handleClick={() => handleSorting("name")}
              />
            </th>
            <th aria-sort={isSortedBy === "devStatus" ? ariaSort : null}>
              <ComponentHeader
                logo={<ReactLogo role="presentation" />}
                label="React"
                isSorted={isSortedBy === "devStatus"}
                ascendingOrder={hasAscendingOrder}
                handleClick={() => handleSorting("devStatus")}
              />
            </th>
            <th aria-sort={isSortedBy === "designStatus" ? ariaSort : null}>
              <ComponentHeader
                logo={<FigmaLogo role="presentation" />}
                label="Figma"
                isSorted={isSortedBy === "designStatus"}
                ascendingOrder={hasAscendingOrder}
                handleClick={() => handleSorting("designStatus")}
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
