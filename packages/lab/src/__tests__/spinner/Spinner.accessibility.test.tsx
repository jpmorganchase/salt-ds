import { render, cleanup, screen } from "@testing-library/react";
import { Spinner } from "../../spinner";
import { AriaAnnouncerProvider } from "@brandname/core";

const mockAnnounce = jest.fn();

jest.mock("@brandname/core", () => ({
  ...jest.requireActual("@brandname/core"),
  useAriaAnnouncer: () => ({
    announce: mockAnnounce,
  }),
}));

const ariaLabel = "Loading component";

describe("GIVEN a Spinner", () => {
  it("THEN it should render with the correct default ARIA attributes", () => {
    render(<Spinner />);
    expect(screen.getByRole("img", { name: "loading" })).toBeInTheDocument();
  });

  it("THEN it should render with a custom ARIA label", () => {
    render(<Spinner aria-label="loading settings panel" />);
    expect(
      screen.getByRole("img", { name: "loading settings panel" })
    ).toBeInTheDocument();
  });

  it("THEN the announcer should be called with aria-label", () => {
    render(
      <AriaAnnouncerProvider>
        <Spinner aria-label={ariaLabel} />
      </AriaAnnouncerProvider>
    );

    expect(mockAnnounce).toHaveBeenCalledWith(ariaLabel);
  });
});

describe("GIVEN an available announcer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    cleanup();
  });

  it("THEN the announcer should be called with aria-label every 5 seconds", () => {
    render(
      <AriaAnnouncerProvider>
        <Spinner aria-label={ariaLabel} />
      </AriaAnnouncerProvider>
    );

    setTimeout(() => {
      expect(mockAnnounce).toHaveBeenCalledWith(ariaLabel);
    }, 5000);
  });

  it("THEN the announcer should be called when the component unmounts", () => {
    const { unmount } = render(
      <AriaAnnouncerProvider>
        <Spinner aria-label={ariaLabel} />
      </AriaAnnouncerProvider>
    );

    unmount();
    expect(mockAnnounce).toHaveBeenCalledWith(`finished ${ariaLabel}`);
  });

  it("THEN nothing should be announced when announcer is disabled", () => {
    const { unmount } = render(
      <AriaAnnouncerProvider>
        <Spinner aria-label={ariaLabel} disableAnnouncer />
      </AriaAnnouncerProvider>
    );

    expect(mockAnnounce).not.toHaveBeenCalledWith(ariaLabel);

    unmount();
    expect(mockAnnounce).not.toHaveBeenCalledWith(`finished ${ariaLabel}`);
  });

  it("THEN it should not announce completion message when set to null", () => {
    const { unmount } = render(
      <AriaAnnouncerProvider>
        <Spinner aria-label={ariaLabel} completionAnnouncement={null} />
      </AriaAnnouncerProvider>
    );

    unmount();
    expect(mockAnnounce).not.toHaveBeenCalledWith(`finished ${ariaLabel}`);
  });
});
