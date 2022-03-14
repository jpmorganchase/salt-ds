import { ComponentMeta, Story } from "@storybook/react";

import { Text, LabelCaption, Div } from "@brandname/lab";
import { transactions } from "./transactions";
import "./Table.css";
import { useEffect, useRef, useState } from "react";

export default {
  title: "Lab/Typography",
  component: Text,
  argTypes: {
    width: {
      description: "For this demo only. Set '0' for 100% width",
      control: { type: "number" },
    },
    height: {
      description: "For this demo only. Set '0' for 100% height",
      control: { type: "number" },
    },
  },
} as ComponentMeta<typeof Text>;

const TextComponent: Story = (props) => {
  const { width, height } = props;

  return (
    <div
      style={{ width: width || "100vw", height: height || "100vh" }}
      className="container"
    >
      <div className="table">
        <div className="row">
          <div className="table-cell">
            <LabelCaption>
              <strong>Date</strong>
            </LabelCaption>
          </div>
          <div className="table-cell">
            <LabelCaption>
              <strong>Amount paid</strong>
            </LabelCaption>
          </div>
          <div className="table-cell">
            <LabelCaption>
              <strong>Activity name</strong>
            </LabelCaption>
          </div>
          <div className="table-cell">
            <LabelCaption>
              <strong>Status</strong>
            </LabelCaption>
          </div>
          <div className="table-cell">
            <LabelCaption>
              <strong>Reference</strong>
            </LabelCaption>
          </div>
          <div className="table-cell">
            <LabelCaption>
              <strong>Payment method</strong>
            </LabelCaption>
          </div>
          <div className="table-cell">
            <LabelCaption>
              <strong>Payment type</strong>
            </LabelCaption>
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
    ],
  },
};
TableExample.args = {
  width: undefined,
  height: undefined,
};
