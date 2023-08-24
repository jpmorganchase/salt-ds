import { ReactElement } from "react";
import { Input, FlowLayout } from "@salt-ds/core";

export const Secondary = (): ReactElement => (
    <Input
        defaultValue="Value"
        variant="secondary"
        style={{width: "256px"}}
    />
);
