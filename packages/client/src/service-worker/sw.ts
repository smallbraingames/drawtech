import { get, update } from "idb-keyval";
import { clientsClaim } from "workbox-core";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";

declare const self: ServiceWorkerGlobalScope;

console.log("[SW] Initializing");

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

self.skipWaiting();
clientsClaim();

self.addEventListener("push", (event) => {
  try {
    const payload = event.data?.json();
    if (!payload) return;
    event.waitUntil(
      self.registration.showNotification(payload.title, {
        body: payload.body,
      })
    );
  } catch (e) {
    console.error("[SW] Error handling push event", e);
  }
});

const NOTIFS = "notifs";
self.addEventListener("push", async () => {
  try {
    const numNotifs: number | undefined = await get(NOTIFS);
    self.navigator.setAppBadge(numNotifs ? numNotifs + 1 : 1);
    update(NOTIFS, (val) => (val || 0) + 1);
  } catch (e) {
    console.error("[SW] Error incrementing notifs", e);
  }
});
