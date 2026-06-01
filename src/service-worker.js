/* eslint-disable no-restricted-globals */

// This service worker is built by Workbox via create-react-app's
// `build` script (InjectManifest). It precaches the app shell so Trackr
// opens offline, while API calls always go to the network.

import { clientsClaim } from "workbox-core";
import { precacheAndRoute, createHandlerBoundToURL } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { StaleWhileRevalidate } from "workbox-strategies";

clientsClaim();

// Precache everything the build pipeline injects (HTML, JS, CSS, icons).
precacheAndRoute(self.__WB_MANIFEST);

// App-shell routing: serve index.html for navigation requests so the SPA
// loads offline. Skip anything under /api and anything that looks like a file.
const fileExtensionRegexp = new RegExp("/[^/?]+\\.[^/]+$");
registerRoute(
  ({ request, url }) => {
    if (request.mode !== "navigate") return false;
    if (url.pathname.startsWith("/api")) return false;
    if (url.pathname.match(fileExtensionRegexp)) return false;
    return true;
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + "/index.html"),
);

// Runtime cache for static assets (images, etc.) with stale-while-revalidate.
registerRoute(
  ({ url }) =>
    url.origin === self.location.origin && /\.(?:png|svg|ico)$/.test(url.pathname),
  new StaleWhileRevalidate({ cacheName: "static-assets" }),
);

// Allow the app to tell a waiting SW to activate immediately.
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
