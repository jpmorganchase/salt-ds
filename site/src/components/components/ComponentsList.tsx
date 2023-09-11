import { useState } from "react";
import {
  componentDetails,
  ComponentDetails,
  ComponentStatus,
} from "./components-list";
import clsx from "clsx";
import { Image } from "@jpmorganchase/mosaic-site-components";
import { Table } from "../mdx/table";
import { Button, Link } from "@salt-ds/core";
import { ArrowDownIcon, ArrowUpIcon, StepActiveIcon } from "@salt-ds/icons";
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

  return componentsListSortedByName().sort(
    (a, b) =>
      (statusSortList.indexOf(a[componentDetail]) -
        statusSortList.indexOf(b[componentDetail])) *
      (ascendingOrder ? 1 : -1)
  );
};

const isExternalLink = (url: string) => /(http(s?)):\/\//i.test(url);

const ComponentNameData = ({ component }: { component: ComponentDetails }) => {
  const { name, docsUrl } = component;

  return docsUrl ? (
    <Link href={docsUrl}>
      <span>{name}</span>
      {isExternalLink(docsUrl) && (
        <Image src="/img/storybook_logo.svg" alt="storybook logo" />
      )}
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
  availableSince?: string;
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
  logo?: JSX.Element;
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
          {logo || (isMobileView && label)}
          {!isMobileView && <span>{label}</span>}
        </span>
        {isSorted && arrowIcon}
      </span>
    </Button>
  );
};

export const ComponentsList = () => {
  const [componentsList, setComponentsList] = useState(
    componentsListSorting("devStatus", false)
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
      <Table>
        <thead>
          <tr>
            <th aria-sort={isSortedBy === "name" ? ariaSort : "none"}>
              <ComponentHeader
                label="Component"
                isSorted={isSortedBy === "name"}
                ascendingOrder={hasAscendingOrder}
                handleClick={() => handleSorting("name")}
              />
            </th>
            <th aria-sort={isSortedBy === "devStatus" ? ariaSort : "none"}>
              <ComponentHeader
                logo={<Image src="/img/react_logo.svg" alt="react logo" />}
                label="React"
                isSorted={isSortedBy === "devStatus"}
                ascendingOrder={hasAscendingOrder}
                handleClick={() => handleSorting("devStatus")}
              />
            </th>
            <th aria-sort={isSortedBy === "designStatus" ? ariaSort : "none"}>
              <ComponentHeader
                logo={<Image src="/img/figma_logo.svg" alt="figma logo" />}
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
      </Table>
    </div>
  );
};
