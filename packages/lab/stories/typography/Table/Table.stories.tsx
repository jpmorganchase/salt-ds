import { ComponentMeta, Story } from "@storybook/react";

import { Text, Div } from "@brandname/lab";
import { transactions } from "./transactions";
import "./Table.css";

export default {
  title: "Lab/Typography",
  component: Text,
  argTypes: {
    wrapperWidth: {
      description: "For this demo only",
      control: { type: "text" },
    },
    wrapperHeight: {
      description: "For this demo only",
      control: { type: "text" },
    },
    lazyLoading: {
      description:
        "Display the text after it's size has been calculated to avoid snapping into shape. Refresh the page after you've changed the prop",
      control: { type: "boolean" },
    },
  },
} as ComponentMeta<typeof Text>;

const TextComponent: Story = (props) => {
  const { wrapperWidth, wrapperHeight, lazyLoading } = props;

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
            <Div lazyLoading={lazyLoading}>
              <strong>Date</strong>
            </Div>
          </div>
          <div className="table-cell">
            <Div lazyLoading={lazyLoading}>
              <strong>Amount paid</strong>
            </Div>
          </div>
          <div className="table-cell">
            <Div lazyLoading={lazyLoading}>
              <strong>Activity name</strong>
            </Div>
          </div>
          <div className="table-cell">
            <Div lazyLoading={lazyLoading}>
              <strong>Status</strong>
            </Div>
          </div>
          <div className="table-cell">
            <Div lazyLoading={lazyLoading}>
              <strong>Reference</strong>
            </Div>
          </div>
          <div className="table-cell">
            <Div lazyLoading={lazyLoading}>
              <strong>Payment method</strong>
            </Div>
          </div>
          <div className="table-cell">
            <Div lazyLoading={lazyLoading}>
              <strong>Payment type</strong>
            </Div>
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
                <Div lazyLoading={lazyLoading}>{date}</Div>
              </div>
              <div className="table-cell">
                <Div lazyLoading={lazyLoading}>{amount_paid}</Div>
              </div>
              <div className="table-cell">
                <Div lazyLoading={lazyLoading}>{activity_name}</Div>
              </div>
              <div className="table-cell">
                <Div lazyLoading={lazyLoading}>{status}</Div>
              </div>
              <div className="table-cell">
                <Div lazyLoading={lazyLoading}>{reference}</Div>
              </div>
              <div className="table-cell">
                <Div lazyLoading={lazyLoading}>{name}</Div>
              </div>
              <div className="table-cell">
                <Div lazyLoading={lazyLoading}>{payment_type}</Div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const TableExample = TextComponent.bind({});
TableExample.parameters = {
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
TableExample.args = {
  wrapperWidth: undefined,
  wrapperHeight: undefined,
};
