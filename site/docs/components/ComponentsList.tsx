import { useState } from "react";
import {
  componentDetails,
  ComponentStatus,
  ComponentDetails,
} from "../components/_index/components-list";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import {
  TearOutIcon,
  StepActiveIcon,
  SortAlphaAscendIcon,
} from "@jpmorganchase/uitk-icons";
import { Button } from "@jpmorganchase/uitk-core";

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
  (a, b) => statusSortList.indexOf(a.status) - statusSortList.indexOf(b.status)
);

const ComponentNameData = ({ component }: { component: ComponentDetails }) => {
  const { status, name, storybookUrl } = component;

  return status === ComponentStatus.READY ? (
    <Link to={storybookUrl}>
      <span>{name}</span> <TearOutIcon />
    </Link>
  ) : (
    <span>{name}</span>
  );
};

const ComponentStatusData = ({
  component,
}: {
  component: ComponentDetails;
}) => {
  const { availableInCoreSince, status } = component;

  return (
    <>
      <StepActiveIcon />
      {availableInCoreSince ? `Released in v${availableInCoreSince}` : status}
    </>
  );
};

const ComponentsList = () => {
  const [componentsList, setComponentsList] = useState(
    componentsListSortedByStatus
  );

  const handleNameSort = () => {
    const componentsListSortedByName = [...componentDetails].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    setComponentsList(componentsListSortedByName);
  };
  return (
    <div className={styles.componentList}>
      <table>
        <thead>
          <tr>
            <th>
              Component
              <Button
                aria-label="sort alphabetically"
                variant="secondary"
                onClick={handleNameSort}
              >
                <SortAlphaAscendIcon />
              </Button>
            </th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {componentsList.map((component, index) => {
            return (
              <tr key={index}>
                <td>
                  <ComponentNameData component={component} />
                </td>
                <td
                  className={clsx(
                    styles.status,
                    styles[statusClass(component.status)]
                  )}
                >
                  <ComponentStatusData component={component} />
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
