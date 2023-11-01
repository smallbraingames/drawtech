import { Address } from "viem";

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    // eslint-disable-next-line no-useless-escape
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const initServiceWorker = async (address: Address) => {
  console.log("[Init Service Worker] Initializing service worker");

  if (Notification.permission !== "granted") {
    await Notification.requestPermission();
  }

  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });
  }

  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    console.warn("[Init Service Worker] No registration found", navigator);
    return;
  }
  const pushServiceUrl = import.meta.env.VITE_PUSH_SERVICE_URL;
  if (!pushServiceUrl) {
    console.warn(
      "[Init Service Worker] No push service URL found, please set VITE_PUSH_SERVICE_URL environment variable"
    );
    return;
  }
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    console.log("[Init Service Worker] No subscription found, subscribing");
    const response = await fetch(`${pushServiceUrl}/vapidPublicKey`, {
      method: "get",
      headers: new Headers({
        "ngrok-skip-browser-warning": "69420",
      }),
    });
    const vapidPublicKey = await response.text();
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    });
  }
  console.log("[Init Service Worker] Subscription found", subscription);
  console.log("[Init Service Worker] Registering subscription");
  fetch(`${pushServiceUrl}/register`, {
    method: "post",
    headers: new Headers({
      "Content-type": "application/json",
      "ngrok-skip-browser-warning": "69420",
    }),
    body: JSON.stringify({ subscription, address }),
  });
};

export default initServiceWorker;
