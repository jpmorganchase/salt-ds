import {
  type Breakpoints,
  isResponsiveProp,
  resolveResponsiveValue,
  useBreakpoint,
  useBreakpoints,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import type React from "react";
import { createContext, useContext, useMemo, useState } from "react";
import type { Contract, StyleContract } from "./StyleContract";

let providerInstanceCount = 0;

/**
 * Props for the StyleContractProvider component.
 * @template T - The type of the contract declarations.
 */
interface StyleContractProviderProps<T extends Contract> {
  defaultContract: StyleContract<T>;
}

/**
 * Value provided by the StyleContractContext.
 * @template T - The type of the contract declarations.
 */
export interface StyleContractProviderValue<T extends Contract> {
  contract: T;
  setContract: (newContract: StyleContract<T> | null) => void;
}

const StyleContractContext = createContext<
  StyleContractProviderValue<any> | undefined
>(undefined);

/**
 * Generate component level styles from a `component` contract.
 * The styles are keyed by component selector and are used to override component tokens.
 */
function generateCustomCssFromContract<T extends Record<string, string>>(
  contract: T,
  matchedBreakpoints: (keyof Breakpoints)[],
  providerClass: string,
  breakpoints: Breakpoints,
): string {
  return Object.entries(contract || {})
    .reduce<string[]>((result, [componentSelector, contract]) => {
      const resolvedContract = isResponsiveProp(contract, breakpoints)
        ? resolveResponsiveValue(contract, matchedBreakpoints)
        : contract;

      if (resolvedContract) {
        const properties = Object.entries(resolvedContract)
          .map(([key, value]) => `--${key}: ${value};`)
          .join(" ");
        const rule = `.${providerClass} ${componentSelector} { ${properties} }`;
        result.push(rule);
      }
      return result;
    }, [])
    .join(" ");
}

/**
 * Generate system-wide styles from a `system` contract.
 * The styles are keyed by system token and are used to override system tokens.
 */ function generateSystemCssFromContract<T extends Record<string, string>>(
  contract: T,
  matchedBreakpoints: (keyof Breakpoints)[],
  providerClass: string,
  breakpoints: Breakpoints,
): string {
  return Object.entries(contract || {})
    .reduce<string[]>((result, [token, value]) => {
      const resolvedValue = isResponsiveProp(value, breakpoints)
        ? resolveResponsiveValue(contract, matchedBreakpoints)
        : value;
      if (resolvedValue) {
        const rule = `.${providerClass} { --${token}: ${value} }`;
        result.push(rule);
      }
      return result;
    }, [])
    .join(" ");
}

/**
 * Provides a style contract to its children.
 * @template T - The type of the contract declarations.
 */
export function StyleContractProvider<T extends Contract>({
  defaultContract,
  children,
}: React.PropsWithChildren<StyleContractProviderProps<T>>) {
  const [contract, setContractState] = useState(defaultContract);

  const setContract = (newContract: StyleContract<T> | null) => {
    setContractState(newContract || defaultContract);
  };

  const providerClass = `salt-style-contract-${providerInstanceCount++}`;
  const { matchedBreakpoints } = useBreakpoint();
  const breakpoints = useBreakpoints();

  const componentCss = useMemo(
    () =>
      generateCustomCssFromContract<T>(
        contract.contract.component,
        matchedBreakpoints,
        providerClass,
        breakpoints,
      ),
    [
      breakpoints,
      contract?.contract.component,
      matchedBreakpoints,
      providerClass,
    ],
  );
  const systemCss = useMemo(
    () =>
      generateSystemCssFromContract<T>(
        contract.contract.system,
        matchedBreakpoints,
        providerClass,
        breakpoints,
      ),
    [breakpoints, contract?.contract.system, matchedBreakpoints, providerClass],
  );

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: `component ${providerClass}`,
    css: componentCss,
    window: targetWindow,
  });
  useComponentCssInjection({
    testId: `system ${providerClass}`,
    css: systemCss,
    window: targetWindow,
  });

  return (
    <StyleContractContext.Provider
      value={{ contract: contract.contract, setContract }}
    >
      <div className={providerClass}>{children}</div>
    </StyleContractContext.Provider>
  );
}

/**
 * Hook to use the style contract context.
 * @template T - The type of the contract declarations.
 */
export function useStyleContract<T extends Contract>() {
  const context = useContext(
    StyleContractContext as React.Context<
      StyleContractProviderValue<T> | undefined
    >,
  );
  if (!context) {
    throw new Error(
      "useStyleContract must be used within a StyleContractProvider.",
    );
  }
  return context;
}
