import {
  HomeIcon,
  NotificationIcon,
  PrintIcon,
  SearchIcon,
} from "@salt-ds/icons";
import {
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonGroupChangeEventHandler,
} from "@salt-ds/lab";
import { useState } from "react";

describe("GIVEN a ToggleButtonGroup with ToggleButtons are passed as children (uncontrolled)", () => {
  it("THEN it should have radiogroup as role", () => {
    cy.mount(
      <ToggleButtonGroup>
        <ToggleButton aria-label="home" tooltipText="Home">
          <HomeIcon />
          Home
        </ToggleButton>
        <ToggleButton aria-label="search" tooltipText="Search">
          <SearchIcon />
          Search
        </ToggleButton>
        <ToggleButton aria-label="print" tooltipText="Print">
          <PrintIcon />
          Print
        </ToggleButton>
        <ToggleButton aria-label="alert" tooltipText="Alert">
          <NotificationIcon />
          Alert
        </ToggleButton>
      </ToggleButtonGroup>
    );

    cy.findByRole("radiogroup").should("exist");
    cy.findByRole("radiogroup").should(
      "have.attr",
      "aria-label",
      "Toggle options"
    );
  });

  it("THEN it should respect to `aria-label` prop", () => {
    cy.mount(
      <ToggleButtonGroup aria-label="My Toggle Button Group">
        <ToggleButton aria-label="home" tooltipText="Home">
          <HomeIcon />
          Home
        </ToggleButton>
        <ToggleButton aria-label="search" tooltipText="Search">
          <SearchIcon />
          Search
        </ToggleButton>
        <ToggleButton aria-label="print" tooltipText="Print">
          <PrintIcon />
          Print
        </ToggleButton>
        <ToggleButton aria-label="alert" tooltipText="Alert">
          <NotificationIcon />
          Alert
        </ToggleButton>
      </ToggleButtonGroup>
    );

    cy.findByRole("radiogroup").should(
      "have.attr",
      "aria-label",
      "My Toggle Button Group"
    );
  });

  it("THEN it should toggle the first item as `defaultSelectedIndex` prop", () => {
    cy.mount(
      <ToggleButtonGroup>
        <ToggleButton aria-label="home" tooltipText="Home">
          <HomeIcon />
          Home
        </ToggleButton>
        <ToggleButton aria-label="search" tooltipText="Search">
          <SearchIcon />
          Search
        </ToggleButton>
        <ToggleButton aria-label="print" tooltipText="Print">
          <PrintIcon />
          Print
        </ToggleButton>
        <ToggleButton aria-label="alert" tooltipText="Alert">
          <NotificationIcon />
          Alert
        </ToggleButton>
      </ToggleButtonGroup>
    );

    cy.findAllByRole("radio").should("have.length", 4);

    cy.findAllByRole("radio").eq(0).should("have.text", "Home");
    cy.findAllByRole("radio").eq(0).should("have.attr", "aria-checked", "true");
    cy.findAllByRole("radio").eq(0).should("have.attr", "tabindex", "0");

    cy.findAllByRole("radio").eq(1).should("have.text", "Search");
    cy.findAllByRole("radio")
      .eq(1)
      .should("have.attr", "aria-checked", "false");
    cy.findAllByRole("radio").eq(1).should("have.attr", "tabindex", "-1");

    cy.findAllByRole("radio").eq(2).should("have.text", "Print");
    cy.findAllByRole("radio")
      .eq(2)
      .should("have.attr", "aria-checked", "false");
    cy.findAllByRole("radio").eq(2).should("have.attr", "tabindex", "-1");

    cy.findAllByRole("radio").eq(3).should("have.text", "Alert");
    cy.findAllByRole("radio")
      .eq(3)
      .should("have.attr", "aria-checked", "false");
    cy.findAllByRole("radio").eq(3).should("have.attr", "tabindex", "-1");
  });

  it("THEN should respect `defaultSelectedIndex` prop", () => {
    cy.mount(
      <ToggleButtonGroup defaultSelectedIndex={1}>
        <ToggleButton aria-label="home" tooltipText="Home">
          <HomeIcon />
          Home
        </ToggleButton>
        <ToggleButton aria-label="search" tooltipText="Search">
          <SearchIcon />
          Search
        </ToggleButton>
        <ToggleButton aria-label="print" tooltipText="Print">
          <PrintIcon />
          Print
        </ToggleButton>
        <ToggleButton aria-label="alert" tooltipText="Alert">
          <NotificationIcon />
          Alert
        </ToggleButton>
      </ToggleButtonGroup>
    );

    cy.findAllByRole("radio")
      .eq(0)
      .should("have.attr", "aria-checked", "false");
    cy.findAllByRole("radio").eq(0).should("have.attr", "tabindex", "-1");

    cy.findAllByRole("radio").eq(1).should("have.attr", "aria-checked", "true");
    cy.findAllByRole("radio").eq(1).should("have.attr", "tabindex", "0");

    cy.findAllByRole("radio")
      .eq(2)
      .should("have.attr", "aria-checked", "false");
    cy.findAllByRole("radio").eq(2).should("have.attr", "tabindex", "-1");

    cy.findAllByRole("radio")
      .eq(3)
      .should("have.attr", "aria-checked", "false");
    cy.findAllByRole("radio").eq(3).should("have.attr", "tabindex", "-1");
  });

  it("THEN should fire onChangeSpy on toggle button click", () => {
    const changeSpy = cy.stub().as("changeSpy");
    cy.mount(
      <ToggleButtonGroup onChange={changeSpy}>
        <ToggleButton aria-label="home" tooltipText="Home">
          <HomeIcon />
          Home
        </ToggleButton>
        <ToggleButton aria-label="search" tooltipText="Search">
          <SearchIcon />
          Search
        </ToggleButton>
        <ToggleButton aria-label="print" tooltipText="Print">
          <PrintIcon />
          Print
        </ToggleButton>
        <ToggleButton aria-label="alert" tooltipText="Alert">
          <NotificationIcon />
          Alert
        </ToggleButton>
      </ToggleButtonGroup>
    );

    cy.findByRole("radio", { name: "search" }).realClick();

    cy.get("@changeSpy").should("have.been.calledOnce");
    cy.get("@changeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      1,
      true
    );

    // Click another toggle button
    cy.findByRole("radio", { name: "print" }).realClick();
    cy.get("@changeSpy").should("have.been.calledTwice");
    cy.get("@changeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      2,
      true
    );
  });

  it("THEN should NOT deselect a button if it's clicked after being toggled", () => {
    const changeSpy = cy.stub().as("changeSpy");
    cy.mount(
      <ToggleButtonGroup defaultSelectedIndex={2} onChange={changeSpy}>
        <ToggleButton aria-label="home" tooltipText="Home">
          <HomeIcon />
          Home
        </ToggleButton>
        <ToggleButton aria-label="search" tooltipText="Search">
          <SearchIcon />
          Search
        </ToggleButton>
        <ToggleButton aria-label="print" tooltipText="Print">
          <PrintIcon />
          Print
        </ToggleButton>
        <ToggleButton aria-label="alert" tooltipText="Alert">
          <NotificationIcon />
          Alert
        </ToggleButton>
      </ToggleButtonGroup>
    );

    // Click toggled button
    cy.findByRole("radio", { name: "print" });

    // It should not call onChange
    cy.get("@changeSpy").should("not.have.been.called");
    // It should not deselect the toggled button
    cy.findByRole("radio", { name: "print" }).should(
      "have.attr",
      "aria-checked",
      "true"
    );
  });
});

describe("GIVEN a ToggleButtonGroup (controlled)", () => {
  it("THEN should respect `selectedIndex` prop", () => {
    const changeSpy = cy.stub().as("changeSpy");
    const ControlledToggleGroupExample = () => {
      const [selectedIndex, setSelectedIndex] = useState<number>(1);

      const handleChange: ToggleButtonGroupChangeEventHandler = (
        event,
        index,
        toggled
      ) => {
        setSelectedIndex(index);
        changeSpy(event, index, toggled);
      };

      return (
        <ToggleButtonGroup
          selectedIndex={selectedIndex}
          onChange={handleChange}
        >
          <ToggleButton aria-label="home" tooltipText="Home">
            <HomeIcon />
            Home
          </ToggleButton>
          <ToggleButton aria-label="search" tooltipText="Search">
            <SearchIcon />
            Search
          </ToggleButton>
          <ToggleButton aria-label="print" tooltipText="Print">
            <PrintIcon />
            Print
          </ToggleButton>
          <ToggleButton aria-label="alert" tooltipText="Alert">
            <NotificationIcon />
            Alert
          </ToggleButton>
        </ToggleButtonGroup>
      );
    };
    cy.mount(<ControlledToggleGroupExample />);

    // 4 toggle buttons
    cy.findAllByRole("radio").should("have.length", 4);

    cy.findAllByRole("radio").eq(0).should("have.text", "Home");
    cy.findAllByRole("radio")
      .eq(0)
      .should("have.attr", "aria-checked", "false");
    cy.findAllByRole("radio").eq(0).should("have.attr", "tabindex", "-1");

    cy.findAllByRole("radio").eq(1).should("have.text", "Search");
    cy.findAllByRole("radio").eq(1).should("have.attr", "aria-checked", "true");
    cy.findAllByRole("radio").eq(1).should("have.attr", "tabindex", "0");

    cy.findAllByRole("radio").eq(2).should("have.text", "Print");
    cy.findAllByRole("radio")
      .eq(2)
      .should("have.attr", "aria-checked", "false");
    cy.findAllByRole("radio").eq(2).should("have.attr", "tabindex", "-1");

    cy.findAllByRole("radio").eq(3).should("have.text", "Alert");
    cy.findAllByRole("radio")
      .eq(3)
      .should("have.attr", "aria-checked", "false");
    cy.findAllByRole("radio").eq(3).should("have.attr", "tabindex", "-1");

    cy.findAllByRole("radio").eq(0).realClick();
    cy.get("@changeSpy").should("have.been.calledOnce");
    cy.get("@changeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      0,
      true
    );
    cy.findAllByRole("radio").eq(0).should("have.attr", "aria-checked", "true");
    cy.findAllByRole("radio").eq(0).should("have.attr", "tabindex", "0");
    cy.findAllByRole("radio").eq(1).should("have.attr", "tabindex", "-1");
  });

  it("THEN should NOT deselect a toggled button", () => {
    const changeSpy = cy.stub().as("changeSpy");
    const ControlledToggleGroupExample = () => {
      const [selectedIndex, setSelectedIndex] = useState<number>(2);

      const handleChange: ToggleButtonGroupChangeEventHandler = (
        event,
        index,
        toggled
      ) => {
        setSelectedIndex(index);
        changeSpy(event, index, toggled);
      };

      return (
        <ToggleButtonGroup
          selectedIndex={selectedIndex}
          onChange={handleChange}
        >
          <ToggleButton aria-label="home" tooltipText="Home">
            <HomeIcon />
            Home
          </ToggleButton>
          <ToggleButton aria-label="search" tooltipText="Search">
            <SearchIcon />
            Search
          </ToggleButton>
          <ToggleButton aria-label="print" tooltipText="Print">
            <PrintIcon />
            Print
          </ToggleButton>
          <ToggleButton aria-label="alert" tooltipText="Alert">
            <NotificationIcon />
            Alert
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
  it("THEN should respect `selectedIndex` prop", () => {
    const changeSpy = cy.stub().as("changeSpy");
    const ControlledToggleGroupExample = () => {
      const [selectedIndex, setSelectedIndex] = useState<number>(1);

      const handleChange: ToggleButtonGroupChangeEventHandler = (
        event,
        index,
        toggled
      ) => {
        setSelectedIndex(index);
        changeSpy(event, index, toggled);
      };

      return (
        <ToggleButtonGroup
          disabled
          selectedIndex={selectedIndex}
          onChange={handleChange}
        >
          <ToggleButton aria-label="home" tooltipText="Home">
            <HomeIcon />
            Home
          </ToggleButton>
          <ToggleButton aria-label="search" tooltipText="Search">
            <SearchIcon />
            Search
          </ToggleButton>
          <ToggleButton aria-label="print" tooltipText="Print">
            <PrintIcon />
            Print
          </ToggleButton>
          <ToggleButton aria-label="alert" tooltipText="Alert">
            <NotificationIcon />
            Alert
          </ToggleButton>
        </ToggleButtonGroup>
      );
    };
    cy.mount(<ControlledToggleGroupExample />);

    // 4 toggle buttons
    cy.findAllByRole("radio").should("have.length", 4);

    cy.findAllByRole("radio").eq(0).should("have.text", "Home");
    cy.findAllByRole("radio")
      .eq(0)
      .should("have.attr", "aria-checked", "false");
    cy.findAllByRole("radio").eq(0).should("have.attr", "tabindex", "-1");
    cy.findAllByRole("radio").eq(0).should("be.disabled");

    cy.findAllByRole("radio").eq(1).should("have.text", "Search");
    cy.findAllByRole("radio").eq(1).should("have.attr", "aria-checked", "true");
    cy.findAllByRole("radio").eq(1).should("have.attr", "tabindex", "-1");
    cy.findAllByRole("radio").eq(1).should("be.disabled");

    cy.findAllByRole("radio").eq(2).should("have.text", "Print");
    cy.findAllByRole("radio")
      .eq(2)
      .should("have.attr", "aria-checked", "false");
    cy.findAllByRole("radio").eq(2).should("have.attr", "tabindex", "-1");
    cy.findAllByRole("radio").eq(2).should("be.disabled");

    cy.findAllByRole("radio").eq(3).should("have.text", "Alert");
    cy.findAllByRole("radio")
      .eq(3)
      .should("have.attr", "aria-checked", "false");
    cy.findAllByRole("radio").eq(3).should("have.attr", "tabindex", "-1");
    cy.findAllByRole("radio").eq(3).should("be.disabled");

    cy.findAllByRole("radio").eq(0).realClick();
    // It should not fire onChange event
    cy.get("@changeSpy").should("not.have.been.called");
  });
});
