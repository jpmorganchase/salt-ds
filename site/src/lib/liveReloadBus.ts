import { EventEmitter } from "node:events";

declare global {
  var __saltMosaicLiveReloadBus: EventEmitter | undefined;
}

// Preserve open browser subscriptions across Next's module reloads in dev.
globalThis.__saltMosaicLiveReloadBus ??= new EventEmitter();
const bus = globalThis.__saltMosaicLiveReloadBus;
bus.setMaxListeners(100);

export function notifyContentChanged() {
  bus.emit("content-changed");
}

export function subscribeContentChanged(handler: () => void) {
  bus.on("content-changed", handler);
  return () => {
    bus.off("content-changed", handler);
  };
}
