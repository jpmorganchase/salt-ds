import { ToggleButton, ToggleButtonGroup } from "@salt-ds/core";
import {
  HomeIcon,
  NotificationIcon,
  PrintIcon,
  SearchIcon,
} from "@salt-ds/icons";
import { type SyntheticEvent, useState } from "react";

describe("GIVEN a ToggleButtonGroup with ToggleButtons are passed as children (uncontrolled)", () => {
  it("THEN it should have radiogroup as role", () => {
    cy.mount(
      <ToggleButtonGroup aria-label="Toggle options">
        <ToggleButton value="alert">
          <NotificationIcon aria-hidden />
          Alert
        </ToggleButton>
        <ToggleButton disabled value="home">
          <HomeIcon aria-hidden />
          Home
        </ToggleButton>
        <ToggleButton value="search">
          <SearchIcon aria-hidden />
          Search
        </ToggleButton>
        <ToggleButton value="print">
          <PrintIcon aria-hidden />
          Print
        </ToggleButton>
      </ToggleButtonGroup>,
    );

    cy.findByRole("radiogroup").should("exist");
    cy.findByRole("radiogroup").should(
      "have.attr",
      "aria-label",
      "Toggle options",
    );
  });

  it("SHOULD respect `defaultValue` prop", () => {
    cy.mount(
      <ToggleButtonGroup aria-label="Toggle options" defaultValue="home">
        <ToggleButton value="alert">
          <NotificationIcon aria-hidden />
          Alert
        </ToggleButton>
        <ToggleButton value="home">
          <HomeIcon aria-hidden />
          Home
        </ToggleButton>
        <ToggleButton value="search">
          <SearchIcon aria-hidden />
          Search
        </ToggleButton>
        <ToggleButton value="print">
          <PrintIcon aria-hidden />
          Print
        </ToggleButton>
      </ToggleButtonGroup>,
    );

    cy.findByRole("radio", { name: "Alert" })
      .should("have.attr", "aria-checked", "false")
      .and("have.attr", "tabindex", "-1");

    cy.findByRole("radio", { name: "Home" })
      .should("have.attr", "aria-checked", "true")
      .and("have.attr", "tabindex", "0");

    cy.findByRole("radio", { name: "Search" })
      .should("have.attr", "aria-checked", "false")
      .and("have.attr", "tabindex", "-1");

    cy.findByRole("radio", { name: "Print" })
      .should("have.attr", "aria-checked", "false")
      .and("have.attr", "tabindex", "-1");
  });

  it("THEN should fire onChange on toggle button click", () => {
    const changeSpy = cy.stub().as("changeSpy");

    const handleChange = (event: SyntheticEvent<HTMLButtonElement>) => {
      // React 16 backwards compatibility
      event.persist();
      changeSpy(event);
    };

    cy.mount(
      <ToggleButtonGroup defaultValue="alert" onChange={handleChange}>
        <ToggleButton value="alert">
          <NotificationIcon aria-hidden />
          Alert
        </ToggleButton>
        <ToggleButton disabled value="home">
          <HomeIcon aria-hidden />
          Home
        </ToggleButton>
        <ToggleButton value="search">
          <SearchIcon aria-hidden />
          Search
        </ToggleButton>
        <ToggleButton value="print">
          <PrintIcon aria-hidden />
          Print
        </ToggleButton>
      </ToggleButtonGroup>,
    );

    cy.findByRole("radio", { name: "Search" }).realClick();

    cy.get("@changeSpy").should("have.been.calledOnce");
    cy.get("@changeSpy").should("have.been.calledWithMatch", {
      target: {
        value: "search",
      },
    });

    // Click another toggle button
    cy.findByRole("radio", { name: "Print" }).realClick();
    cy.get("@changeSpy").should("have.been.calledTwice");
    cy.get("@changeSpy").should("have.been.calledWithMatch", {
      target: {
        value: "print",
      },
    });
  });

  it("THEN should NOT deselect a button if it's clicked after being toggled", () => {
    const changeSpy = cy.stub().as("changeSpy");
    cy.mount(
      <ToggleButtonGroup defaultValue="print" onChange={changeSpy}>
        <ToggleButton value="alert">
          <NotificationIcon aria-hidden />
          Alert
        </ToggleButton>
        <ToggleButton disabled value="home">
          <HomeIcon aria-hidden />
          Home
        </ToggleButton>
        <ToggleButton value="search">
          <SearchIcon aria-hidden />
          Search
        </ToggleButton>
        <ToggleButton value="print">
          <PrintIcon aria-hidden />
          Print
        </ToggleButton>
      </ToggleButtonGroup>,
    );

    // Click toggled button
    cy.findByRole("radio", { name: "Print" });

    // It should not call onChange
    cy.get("@changeSpy").should("not.have.been.called");
    // It should not deselect the toggled button
    cy.findByRole("radio", { name: "Print" }).should(
      "have.attr",
      "aria-checked",
      "true",
    );
  });
});

describe("GIVEN a ToggleButtonGroup (controlled)", () => {
  it("THEN should respect `value` prop", () => {
    const changeSpy = cy.stub().as("changeSpy");
    const ControlledToggleGroupExample = () => {
      const [value, setValue] = useState<string>("print");

      const handleChange = (event: SyntheticEvent<HTMLButtonElement>) => {
        // React 16 backwards compatibility
        event.persist();
        setValue(event.currentTarget.value);
        changeSpy(event);
      };

      return (
        <ToggleButtonGroup value={value} onChange={handleChange}>
          <ToggleButton value="alert">
            <NotificationIcon aria-hidden />
            Alert
          </ToggleButton>
          <ToggleButton disabled value="home">
            <HomeIcon aria-hidden />
            Home
          </ToggleButton>
          <ToggleButton value="search">
            <SearchIcon aria-hidden />
            Search
          </ToggleButton>
          <ToggleButton value="print">
            <PrintIcon aria-hidden />
            Print
          </ToggleButton>
        </ToggleButtonGroup>
      );
    };
    cy.mount(<ControlledToggleGroupExample />);

    // 4 toggle buttons
    cy.findAllByRole("radio").should("have.length", 4);

    cy.findAllByRole("radio").eq(0).should("have.text", "Alert");
    cy.findAllByRole("radio")
      .eq(0)
      .should("have.attr", "aria-checked", "false");
    cy.findAllByRole("radio").eq(0).should("have.attr", "tabindex", "-1");

    cy.findAllByRole("radio").eq(1).should("have.text", "Home");
    cy.findAllByRole("radio")
      .eq(1)
      .should("have.attr", "aria-checked", "false");
    cy.findAllByRole("radio").eq(1).should("have.attr", "tabindex", "-1");

    cy.findAllByRole("radio").eq(2).should("have.text", "Search");
    cy.findAllByRole("radio")
      .eq(2)
      .should("have.attr", "aria-checked", "false");
    cy.findAllByRole("radio").eq(2).should("have.attr", "tabindex", "-1");

    cy.findAllByRole("radio").eq(3).should("have.text", "Print");
    cy.findAllByRole("radio").eq(3).should("have.attr", "aria-checked", "true");
    cy.findAllByRole("radio").eq(3).should("have.attr", "tabindex", "0");

    cy.findAllByRole("radio").eq(0).realClick();
    cy.get("@changeSpy").should("have.been.calledOnce");
    cy.get("@changeSpy").should("have.been.calledWithMatch", {
      target: {
        value: "alert",
      },
    });
    cy.findAllByRole("radio").eq(0).should("have.attr", "aria-checked", "true");
    cy.findAllByRole("radio").eq(0).should("have.attr", "tabindex", "0");
    cy.findAllByRole("radio").eq(3).should("have.attr", "tabindex", "-1");
  });

  it("THEN should NOT deselect a toggled button", () => {
    const changeSpy = cy.stub().as("changeSpy");
    const ControlledToggleGroupExample = () => {
      const [value, setValue] = useState<string>("search");

      const handleChange = (event: SyntheticEvent<HTMLButtonElement>) => {
        setValue(event.currentTarget.value);
        changeSpy(event);
      };

      return (
        <ToggleButtonGroup value={value} onChange={handleChange}>
          <ToggleButton value="alert">
            <NotificationIcon aria-hidden />
            Alert
          </ToggleButton>
          <ToggleButton disabled value="home">
            <HomeIcon aria-hidden />
            Home
          </ToggleButton>
          <ToggleButton value="search">
            <SearchIcon aria-hidden />
            Search
          </ToggleButton>
          <ToggleButton value="print">
            <PrintIcon aria-hidden />
            Print
          </ToggleButton>
        </ToggleButtonGroup>
      );
    };
    cy.mount(<ControlledToggleGroupExample />);

    // Click toggled button
    cy.findAllByRole("radio").eq(2).realClick();

    // It should not call onChange
    cy.get("@changeSpy").should("not.have.been.called");
    // It should not deselect the toggled button
    cy.findAllByRole("radio").eq(2).should("have.attr", "aria-checked", "true");
  });
});

describe("GIVEN a disabled ToggleButtonGroup ", () => {
  it("THEN should respect `value` prop", () => {
    const changeSpy = cy.stub().as("changeSpy");
    const ControlledToggleGroupExample = () => {
      const [value, setValue] = useState<string>("search");

      const handleChange = (event: SyntheticEvent<HTMLButtonElement>) => {
        // React 16 backwards compatibility
        event.persist();
        setValue(event.currentTarget.value);
        changeSpy(event);
      };

      return (
        <ToggleButtonGroup disabled value={value} onChange={handleChange}>
          <ToggleButton value="alert">
            <NotificationIcon aria-hidden />
            Alert
          </ToggleButton>
          <ToggleButton disabled value="home">
            <HomeIcon aria-hidden />
            Home
          </ToggleButton>
          <ToggleButton value="search">
            <SearchIcon aria-hidden />
            Search
          </ToggleButton>
          <ToggleButton value="print">
            <PrintIcon aria-hidden />
            Print
          </ToggleButton>
        </ToggleButtonGroup>
      );
    };
    cy.mount(<ControlledToggleGroupExample />);

    // 4 toggle buttons
    cy.findAllByRole("radio").should("have.length", 4);

    cy.findAllByRole("radio").eq(0).should("have.text", "Alert");
    cy.findAllByRole("radio")
      .eq(0)
      .should("have.attr", "aria-checked", "false");
    cy.findAllByRole("radio").eq(0).should("have.attr", "tabindex", "-1");
    cy.findAllByRole("radio").eq(0).should("be.disabled");

    cy.findAllByRole("radio").eq(1).should("have.text", "Home");
    cy.findAllByRole("radio")
      .eq(1)
      .should("have.attr", "aria-checked", "false");
    cy.findAllByRole("radio").eq(1).should("have.attr", "tabindex", "-1");
    cy.findAllByRole("radio").eq(1).should("be.disabled");

    cy.findAllByRole("radio").eq(2).should("have.text", "Search");
    // Disabled selected toggle button should be focusable
    cy.findAllByRole("radio").eq(2).should("have.attr", "aria-checked", "true");
    cy.findAllByRole("radio").eq(2).should("have.attr", "tabindex", "0");
    cy.findAllByRole("radio")
      .eq(2)
      .should("have.attr", "aria-disabled", "true");

    cy.findAllByRole("radio").eq(3).should("have.text", "Print");
    cy.findAllByRole("radio")
      .eq(3)
      .should("have.attr", "aria-checked", "false");
    cy.findAllByRole("radio").eq(3).should("have.attr", "tabindex", "-1");
    cy.findAllByRole("radio").eq(3).should("be.disabled");

    cy.findAllByRole("radio").eq(0).realClick();
    // It should not fire onChange event
    cy.get("@changeSpy").should("not.have.been.called");
    // Click the disabled selected toggle button should not fire onChange event
    cy.findAllByRole("radio").eq(2).realClick();
    // It should not fire onChange event
    cy.get("@changeSpy").should("not.have.been.called");
  });
});
