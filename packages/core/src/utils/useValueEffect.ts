/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import { type Dispatch, type MutableRefObject, useRef, useState } from "react";
import { useEventCallback } from "./useEventCallback";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

type SetValueAction<S> = (prev: S) => Generator<any, void, unknown>;

// This hook works like `useState`, but when setting the value, you pass a generator function
// that can yield multiple values. Each yielded value updates the state and waits for the next
// layout effect, then continues the generator. This allows sequential updates to state to be
// written linearly.
export function useValueEffect<S>(
  defaultValue: S | (() => S),
): [S, Dispatch<SetValueAction<S>>] {
  const [value, setValue] = useState(defaultValue);
  const effect: MutableRefObject<Generator<S> | null> =
    useRef<Generator<S> | null>(null);

  // Store the function in a ref so we can always access the current version
  // which has the proper `value` in scope.
  const nextRef = useEventCallback(() => {
    if (!effect.current) {
      return;
    }
    // Run the generator to the next yield.
    const newValue = effect.current.next();

    // If the generator is done, reset the effect.
    if (newValue.done) {
      effect.current = null;
      return;
    }

    // If the value is the same as the current value,
    // then continue to the next yield. Otherwise,
    // set the value in state and wait for the next layout effect.
    if (value === newValue.value) {
      nextRef();
    } else {
      setValue(newValue.value);
    }
  });

  useIsomorphicLayoutEffect(() => {
    // If there is an effect currently running, continue to the next yield.
    if (effect.current) {
      nextRef();
    }
  });

  const queue: Dispatch<SetValueAction<S>> = useEventCallback((fn) => {
    effect.current = fn(value);
    nextRef();
  });

  return [value, queue];
}
