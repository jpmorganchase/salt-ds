import { ComponentMeta, Story } from "@storybook/react";

import { Text, Div } from "@jpmorganchase/uitk-lab";
import { transactions } from "./transactions";
import "./Table.css";

export default {
  title: "Lab/Typography",
  component: Text,
  parameters: {
    controls: {
      exclude: [
        "elementType",
        "maxRows",
        "showTooltip",
        "tooltipProps",
        "truncate",
        "style",
        "styleAs",
        "onOverflowChange",
        "ref",
        "tooltipText",
      ],
    },
  },
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
            <Div truncate={true}>
              <strong>Date</strong>
            </Div>
          </div>
          <div className="table-cell">
            <Div truncate={true}>
              <strong>Amount paid</strong>
            </Div>
          </div>
          <div className="table-cell">
            <Div truncate={true}>
              <strong>Activity name</strong>
            </Div>
          </div>
          <div className="table-cell">
            <Div truncate={true}>
              <strong>Status</strong>
            </Div>
          </div>
          <div className="table-cell">
            <Div truncate={true}>
              <strong>Reference</strong>
            </Div>
          </div>
          <div className="table-cell">
            <Div truncate={true}>
              <strong>Payment method</strong>
            </Div>
          </div>
          <div className="table-cell">
            <Div truncate={true}>
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
                <Div truncate={true}>{date}</Div>
              </div>
              <div className="table-cell">
                <Div truncate={true}>{amount_paid}</Div>
              </div>
              <div className="table-cell">
                <Div truncate={true}>{activity_name}</Div>
              </div>
              <div className="table-cell">
                <Div truncate={true}>{status}</Div>
              </div>
              <div className="table-cell">
                <Div truncate={true}>{reference}</Div>
              </div>
              <div className="table-cell">
                <Div truncate={true}>{name}</Div>
              </div>
              <div className="table-cell">
                <Div truncate={true}>{payment_type}</Div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const TableExample = TextComponent.bind({});
TableExample.args = {
  wrapperWidth: undefined,
  wrapperHeight: undefined,
};
