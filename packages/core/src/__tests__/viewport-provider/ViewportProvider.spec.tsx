import { render } from "@testing-library/react";
import { ViewportProvider, ViewportContext } from "../../viewport";

const createMockResizeObserver = () => {
  const MockResizeObserver = jest
    .fn()
    .mockImplementation((callback: (data: any) => void) => {
      const storedCallback = () =>
        callback([
          {
            contentRect: {
              width: 100,
            },
          },
        ]);

      return {
        observe: jest.fn().mockImplementation(() => {
          storedCallback();
        }),
        disconnect: jest.fn(),
      };
    });

  global.ResizeObserver = MockResizeObserver;
};

describe("GIVEN a ViewportProvider", () => {
  describe("WHEN there is no parent ViewportProvider", () => {
    it("THEN it should create a ResizeObserver", () => {
      createMockResizeObserver();

      render(<ViewportProvider />);
      expect(global.ResizeObserver).toHaveBeenCalledTimes(1);
    });
  });

  describe("WHEN there is a parent ViewportProvider", () => {
    it("THEN it should not create an additional ResizeObserver", () => {
      createMockResizeObserver();

      render(
        <ViewportProvider>
          <ViewportProvider />
        </ViewportProvider>
      );
      expect(global.ResizeObserver).toHaveBeenCalledTimes(1);
    });
  });

  describe("WHEN ViewportContext is not null", () => {
    it("THEN it should not create an additional ResizeObserver", () => {
      createMockResizeObserver();

      render(
        <ViewportContext.Provider value={100}>
          <ViewportProvider />
        </ViewportContext.Provider>
      );
      expect(global.ResizeObserver).toHaveBeenCalledTimes(0);
    });
  });

  describe("WHEN ViewportContext is zero", () => {
    it("THEN it should not create an additional ResizeObserver", () => {
      createMockResizeObserver();

      render(
        <ViewportContext.Provider value={0}>
          <ViewportProvider />
        </ViewportContext.Provider>
      );
      expect(global.ResizeObserver).toHaveBeenCalledTimes(0);
    });
  });

  describe("WHEN ViewportContext is null", () => {
    it("THEN it should create an additional ResizeObserver", () => {
      createMockResizeObserver();

      render(
        <ViewportContext.Provider value={null}>
          <ViewportProvider />
        </ViewportContext.Provider>
      );
      expect(global.ResizeObserver).toHaveBeenCalledTimes(1);
    });
  });
});
