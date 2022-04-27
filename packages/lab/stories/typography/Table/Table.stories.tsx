import { ComponentMeta, Story } from "@storybook/react";

import { Text, Div } from "@jpmorganchase/uitk-lab";
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
  },
} as ComponentMeta<typeof Text>;

interface TableExampleStoryProps {
  wrapperWidth?: string;
  wrapperHeight?: string;
}

const TextComponent: Story<TableExampleStoryProps> = (props) => {
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
            <Div>
              <strong>Date</strong>
            </Div>
          </div>
          <div className="table-cell">
            <Div>
              <strong>Amount paid</strong>
            </Div>
          </div>
          <div className="table-cell">
            <Div>
              <strong>Activity name</strong>
            </Div>
          </div>
          <div className="table-cell">
            <Div>
              <strong>Status</strong>
            </Div>
          </div>
          <div className="table-cell">
            <Div>
              <strong>Reference</strong>
            </Div>
          </div>
          <div className="table-cell">
            <Div>
              <strong>Payment method</strong>
            </Div>
          </div>
          <div className="table-cell">
            <Div>
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
                <Div>{date}</Div>
              </div>
              <div className="table-cell">
                <Div>{amount_paid}</Div>
              </div>
              <div className="table-cell">
                <Div>{activity_name}</Div>
              </div>
              <div className="table-cell">
                <Div>{status}</Div>
              </div>
              <div className="table-cell">
                <Div>{reference}</Div>
              </div>
              <div className="table-cell">
                <Div>{name}</Div>
              </div>
              <div className="table-cell">
                <Div>{payment_type}</Div>
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
