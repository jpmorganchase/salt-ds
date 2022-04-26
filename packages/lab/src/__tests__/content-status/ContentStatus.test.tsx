import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { AriaAnnouncerProvider } from "@brandname/core";
import { ContentStatus } from "../../content-status";

// Mock aria announcer to avoid the warnings
const mockAnnounce = jest.fn();

jest.mock("@brandname/core", () => ({
  ...jest.requireActual("@brandname/core"),
  useAriaAnnouncer: () => ({
    announce: mockAnnounce,
  }),
}));

describe("GIVEN Content Status", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("renders the info status with NO title AND NO message and NO actions WHEN no props are passed", () => {
    const { getByTestId, queryByRole } = render(<ContentStatus id="1" />);

    const contentStatusContainer = queryByRole("region");
    const icon = getByTestId("InfoIcon");
    expect(icon).toBeDefined();
    expect(contentStatusContainer).toBeNull();
  });

  test("renders the spinner WHEN the LOADING status is passed", () => {
    const { getByTestId, queryByRole } = render(
      <AriaAnnouncerProvider>
        <ContentStatus id="1" status="loading" />
      </AriaAnnouncerProvider>
    );

    const contentStatusContainer = queryByRole("region");
    const spinner = getByTestId("spinner-1");
    expect(spinner).toBeDefined();
    expect(contentStatusContainer).toBeNull();

    expect(mockAnnounce).toHaveBeenCalledWith("loading");
  });

  test("renders the correct icon WHEN the WARNING status is passed", () => {
    const { getByTestId, queryByRole } = render(
      <AriaAnnouncerProvider>
        <ContentStatus id="1" status="warning" />
      </AriaAnnouncerProvider>
    );

    const contentStatusContainer = queryByRole("region");
    const icon = getByTestId("WarningIcon");
    expect(icon).toBeDefined();
    expect(contentStatusContainer).toBeNull();

    expect(mockAnnounce).toHaveBeenCalledWith("warning");
  });

  test("renders the correct icon WHEN the ERROR status is passed", () => {
    const { getByTestId, queryByRole } = render(
      <AriaAnnouncerProvider>
        <ContentStatus id="1" status="error" />
      </AriaAnnouncerProvider>
    );

    const contentStatusContainer = queryByRole("region");
    const icon = getByTestId("ErrorIcon");
    expect(icon).toBeDefined();
    expect(contentStatusContainer).toBeNull();

    expect(mockAnnounce).toHaveBeenCalledWith("error");
  });

  test("renders the correct icon WHEN the SUCCESS status is passed", () => {
    const { getByTestId, queryByRole } = render(
      <AriaAnnouncerProvider>
        <ContentStatus id="1" status="success" />
      </AriaAnnouncerProvider>
    );

    const contentStatusContainer = queryByRole("region");
    const icon = getByTestId("SuccessIcon");
    expect(icon).toBeDefined();
    expect(contentStatusContainer).toBeNull();

    expect(mockAnnounce).toHaveBeenCalledWith("success");
  });

  test("renders the correct title WHEN it is passed", () => {
    const { getByTestId, getByText, getByRole } = render(
      <AriaAnnouncerProvider>
        <ContentStatus id="1" title="Test Title" />
      </AriaAnnouncerProvider>
    );

    const contentStatusContainer = getByRole("region");
    const title = getByText("Test Title");
    const icon = getByTestId("InfoIcon");
    expect(icon).toBeDefined();
    expect(title).toBeDefined();
    expect(contentStatusContainer.children.length).toBe(1);

    expect(mockAnnounce).toHaveBeenCalledWith("Test Title info");
  });

  test("renders the correct message WHEN it is passed", () => {
    const { getByTestId, getByText, getByRole } = render(
      <AriaAnnouncerProvider>
        <ContentStatus id="1" message="Test message." />
      </AriaAnnouncerProvider>
    );

    const contentStatusContainer = getByRole("region");
    const message = getByText("Test message.");
    const icon = getByTestId("InfoIcon");
    expect(icon).toBeDefined();
    expect(message).toBeDefined();
    expect(contentStatusContainer.children.length).toBe(1);

    expect(mockAnnounce).toHaveBeenCalledWith("Test message. info");
  });

  test("render default actions WHEN actionLabel and onActionClick are passed", () => {
    const onActionClickSpy = jest.fn();
    const { getByTestId, getByText, getByRole } = render(
      <AriaAnnouncerProvider>
        <ContentStatus
          actionLabel="My Label"
          id="1"
          onActionClick={onActionClickSpy}
        />
      </AriaAnnouncerProvider>
    );

    const contentStatusContainer = getByRole("region");
    const actionButton = getByText("My Label");
    const icon = getByTestId("InfoIcon");
    expect(icon).toBeDefined();
    expect(actionButton).toBeDefined();
    expect(contentStatusContainer.children.length).toBe(1);

    fireEvent.click(actionButton);
    expect(onActionClickSpy).toHaveBeenCalledTimes(1);

    expect(mockAnnounce.mock.calls[0][0].includes("My Label")).toBeFalsy();
    expect(mockAnnounce).toHaveBeenCalledWith("info");
  });

  test("DOES NOT render actions WHEN actionLabel IS NOT passed", () => {
    const onActionClickSpy = jest.fn();
    const { getByTestId, queryByText, queryByRole } = render(
      <ContentStatus id="1" onActionClick={onActionClickSpy} />
    );

    const contentStatusContainer = queryByRole("region");
    const actionButton = queryByText("My Label");
    const icon = getByTestId("InfoIcon");
    expect(icon).toBeDefined();
    expect(actionButton).toBeNull();
    expect(contentStatusContainer).toBeNull();
  });

  test("DOES NOT render actions WHEN onActionClick IS NOT passed", () => {
    const { getByTestId, queryByText, queryByRole } = render(
      <ContentStatus actionLabel="My Label" id="1" />
    );

    const contentStatusContainer = queryByRole("region");
    const actionButton = queryByText("My Label");
    const icon = getByTestId("InfoIcon");
    expect(icon).toBeDefined();
    expect(actionButton).toBeNull();
    expect(contentStatusContainer).toBeNull();
  });

  test("render children as actions WHEN they are passed", () => {
    const { getByTestId, getByText, getByRole } = render(
      <ContentStatus id="1">
        <div>Test Children</div>
      </ContentStatus>
    );

    const contentStatusContainer = getByRole("region");
    const childrenAsActions = getByText("Test Children");
    const icon = getByTestId("InfoIcon");
    expect(icon).toBeDefined();
    expect(childrenAsActions).toBeDefined();
    expect(contentStatusContainer.children.length).toBe(1);
  });

  test("buttonRef callback function is called WHEN the button is mounted", () => {
    const buttonRefSpy = jest.fn();
    const { container, getByRole } = render(
      <ContentStatus
        actionLabel="My Label"
        buttonRef={buttonRefSpy}
        id="1"
        onActionClick={jest.fn()}
      />
    );

    const contentStatusContainer = getByRole("region");
    const actionButton = container.querySelector("button");
    expect(actionButton).toBeDefined();
    expect(contentStatusContainer.children.length).toBe(1);
    expect(buttonRefSpy).toHaveBeenCalledTimes(1);
    expect(buttonRefSpy).toHaveBeenCalledWith(actionButton);
  });

  test("buttonRef object is populated WHEN the button is mounted", () => {
    const buttonRefSpy = React.createRef();
    const { container, getByRole } = render(
      <ContentStatus
        actionLabel="My Label"
        buttonRef={buttonRefSpy}
        id="1"
        onActionClick={jest.fn()}
      />
    );

    const contentStatusContainer = getByRole("region");
    const actionButton = container.querySelector("button");
    expect(actionButton).toBeDefined();
    expect(contentStatusContainer.children.length).toBe(1);
    expect(buttonRefSpy.current).toEqual(actionButton);
  });

  test("announces when new prop is passed in", () => {
    const { rerender } = render(
      <AriaAnnouncerProvider>
        <ContentStatus id="1" status="loading" />
      </AriaAnnouncerProvider>
    );

    expect(mockAnnounce).toHaveBeenCalledWith("loading");

    rerender(
      <AriaAnnouncerProvider>
        <ContentStatus id="1" status="success" />
      </AriaAnnouncerProvider>
    );

    // Disabled completion announcement from spinner
    expect(mockAnnounce).not.toHaveBeenCalledWith("finished loading");
    expect(mockAnnounce).toHaveBeenCalledWith("success");
  });

  test("disableAnnouncer will disable the announcement", () => {
    render(
      <AriaAnnouncerProvider>
        <ContentStatus disableAnnouncer id="1" status="loading" />
      </AriaAnnouncerProvider>
    );

    expect(mockAnnounce).not.toHaveBeenCalledWith("loading");
  });

  /* TODO: custom ariaLabel prop removed causing issues here */
  // describe("indeterminate loading", () => {
  //   beforeEach(() => {
  //     jest.clearAllMocks();
  //     jest.useFakeTimers();
  //   });

  //   afterEach(() => {
  //     jest.runOnlyPendingTimers();
  //     jest.useRealTimers();
  //   });

  //   test("props from spinner can be customized", () => {
  //     const ariaLabel = "Loading component";

  //     render(
  //       <AriaAnnouncerProvider>
  //         <ContentStatus
  //           SpinnerProps={{ "aria-label": ariaLabel, announcerInterval: 2000 }}
  //           status="loading"
  //         />
  //       </AriaAnnouncerProvider>
  //     );

  //     jest.advanceTimersByTime(2500);

  //     expect(mockAnnounce).toHaveBeenCalledWith(ariaLabel);
  //   });
  // });
});
