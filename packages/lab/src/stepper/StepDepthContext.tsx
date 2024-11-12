import { createContext } from 'react';

import { type Step } from './Step';

export const StepDepthContext = createContext<Step.Depth>(0);
export const StepDepthProvider = StepDepthContext.Provider;