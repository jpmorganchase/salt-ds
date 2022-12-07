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
  return (
    <div className={clsx(styles.status, styles[statusClass(status)])}>
      <StepActiveIcon />
      <span>{availableSince ? `Released in v${availableSince}` : status}</span>
    </div>
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
            <th className={styles.nameSort}>
              Component
              <Button
                aria-label="sort alphabetically"
                variant="secondary"
                onClick={handleNameSort}
              >
                <SortAlphaAscendIcon />
              </Button>
            </th>
            <th>React</th>
            <th>Figma</th>
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
