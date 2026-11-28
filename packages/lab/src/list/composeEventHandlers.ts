/**
 * Returns an event handler that calls the internal handler, then the
 * consumer's, so a consumer's handler doesn't replace the internal one.
 */
export function composeEventHandlers<E>(
  internalHandler?: (event: E) => void,
  consumerHandler?: (event: E) => void,
) {
  return (event: E) => {
    internalHandler?.(event);
    consumerHandler?.(event);
  };
}
