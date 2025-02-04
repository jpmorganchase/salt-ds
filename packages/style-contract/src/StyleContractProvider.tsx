import React, { createContext, useContext, useEffect, useState } from "react";
import {
  Breakpoints,
  resolveResponsiveValue,
  isResponsiveProp,
  useBreakpoint,
  useBreakpoints,
} from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { z, ZodSchema } from "zod";
import { StyleContract } from "./StyleContract";

let providerInstanceCount = 0;

interface StyleContractProviderProps<T extends ZodSchema<any>> {
  defaultContract: StyleContract<T>;
}

export interface StyleContractProviderValue<T extends ZodSchema<any>> {
  contract: z.infer<T>;
  setContract: (newContract: StyleContract<T> | null) => void;
}

const StyleContractContext = createContext<
  StyleContractProviderValue<any> | undefined
>(undefined);

function generateCssFromContracts(
  contract: Record<string, string>,
  matchedBreakpoints: (keyof Breakpoints)[],
  providerClass: string,
): string {
  const breakpoints = useBreakpoints();
  return Object.entries(contract)
    .reduce<string[]>((result, [componentSelector, contract]) => {
      let resolvedContract;
      if (isResponsiveProp(contract, breakpoints)) {
        resolvedContract = resolveResponsiveValue(contract, matchedBreakpoints);
      } else {
        resolvedContract = contract;
      }
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

export function StyleContractProvider<T extends ZodSchema<any>>({
  defaultContract,
  children,
}: React.PropsWithChildren<StyleContractProviderProps<T>>) {
  const [contract, setContractState] = useState(defaultContract);

  function setContract(newContract: StyleContract<T> | null) {
    if (newContract) {
      setContractState(newContract);
    } else {
      setContractState(defaultContract);
    }
  }

  useEffect(() => {
    try {
      contract.validate();
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error(error);
      }
    }
  }, [contract]);

  const providerClass = `salt-style-contract-${providerInstanceCount++}`;
  const { matchedBreakpoints } = useBreakpoint();

  const css = generateCssFromContracts(
    contract.contract,
    matchedBreakpoints,
    providerClass,
  );

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: providerClass,
    css,
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

export function useStyleContract<T extends ZodSchema<any>>() {
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
