import {
  componentDetails,
  ComponentStatus,
  ComponentDetails,
} from "../components/_index/components-list";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import { TearOutIcon, StepActiveIcon } from "@jpmorganchase/uitk-icons";

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
  return (
    <div className={styles.componentList}>
      <table>
        <thead>
          <tr>
            <th>Component</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {componentDetails.map((component, index) => {
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
