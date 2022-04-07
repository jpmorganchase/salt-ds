import { ComponentMeta, Story } from "@storybook/react";

import { Text } from "@brandname/lab";
import { transactions } from "./Table/transactions";
import "./Table/Table.css";

export default {
  title: "Lab/Typography",
  component: "Text",
  argTypes: {
    wrapperWidth: {
      description: "For this demo only",
      control: { type: "text" },
    },
    wrapperHeight: {
      description: "For this demo only",
      control: { type: "text" },
    },
  },
};

const TextComponent: Story = (props) => {
  const { wrapperWidth, wrapperHeight } = props;

  return (
    <div
      style={{
        width: wrapperWidth || "100vw",
        height: wrapperHeight || "100vh",
      }}
      className="container"
    >
      <div className="table">
        <div className="row">
          <div className="table-cell">
            <div>
              <strong>Date</strong>
            </div>
          </div>
          <div className="table-cell">
            <div>
              <strong>Amount paid</strong>
            </div>
          </div>
          <div className="table-cell">
            <div>
              <strong>Activity name</strong>
            </div>
          </div>
          <div className="table-cell">
            <div>
              <strong>Status</strong>
            </div>
          </div>
          <div className="table-cell">
            <div>
              <strong>Reference</strong>
            </div>
          </div>
          <div className="table-cell">
            <div>
              <strong>Payment method</strong>
            </div>
          </div>
          <div className="table-cell">
            <div>
              <strong>Payment type</strong>
            </div>
          </div>
        </div>

        {transactions.slice(0, 500).map((item) => {
          const {
            activity_name,
            amount_paid,
            date,
            id,
            reference,
            status,
            payment_type,
            payment_method: { name },
          } = item;
          return (
            <div className="row" key={id}>
              <div className="table-cell">
                <div>{date}</div>
              </div>
              <div className="table-cell">
                <div>{amount_paid}</div>
              </div>
              <div className="table-cell">
                <div>{activity_name}</div>
              </div>
              <div className="table-cell">
                <div>{status}</div>
              </div>
              <div className="table-cell">
                <div>{reference}</div>
              </div>
              <div className="table-cell">
                <div>{name}</div>
              </div>
              <div className="table-cell">
                <div>{payment_type}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const SimpleTable = TextComponent.bind({});
SimpleTable.parameters = {
  controls: {
    exclude: [
      "children",
      "elementType",
      "maxRows",
      "showTooltip",
      "tooltipProps",
      "truncate",
      "expanded",
      "style",
      "onOverflow",
      "marginTop",
      "marginBottom",
    ],
  },
};
SimpleTable.args = {
  wrapperWidth: undefined,
  wrapperHeight: undefined,
};
