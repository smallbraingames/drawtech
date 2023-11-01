#!/usr/bin/env node
import cors from "cors";
import "dotenv/config";
import express from "express";
import { applicationDefault, cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { existsSync, readFileSync } from "fs";
import { Address, getAddress } from "viem";
import webPush from "web-push";

import createNetwork from "./network/createNetwork";
import sendNotifications from "./sendNotifications";

initializeApp({
  credential: existsSync("./drawtech-key.json")
    ? cert(JSON.parse(readFileSync("./drawtech-key.json").toString()))
    : applicationDefault(),
});

const db = getFirestore();

const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 3001;

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
if (!vapidPublicKey || !vapidPrivateKey) {
  throw new Error(
    "[Push Service] VAPID keys not found, please set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables",
  );
}

webPush.setVapidDetails("https://draw.tech", vapidPublicKey, vapidPrivateKey);

app.get("/vapidPublicKey", (req, res) => {
  console.log("getting vapid public key", process.env.VAPID_PUBLIC_KEY);
  res.send(process.env.VAPID_PUBLIC_KEY);
});

const registerRef = db.collection("subscriptions");

app.post("/register", (req, res) => {
  const subscription = req.body.subscription as webPush.PushSubscription;
  try {
    const address = getAddress(req.body.address);
    console.log(
      "[Push Service: Register] Registering subscription for address",
      subscription,
      address,
    );
    const doc = registerRef.doc(address);
    doc.set({ subscription });
    res.sendStatus(201).end();
  } catch (e) {
    console.error("[Push Service: Register] Error registering subscription", e);
    res.sendStatus(500).end();
  }
});

const sendNotification = async (
  address: Address,
  title: string,
  body: string,
) => {
  const doc = await registerRef.doc(address).get();
  if (!doc.exists) {
    return;
  }
  const subscription = doc.data().subscription as webPush.PushSubscription;
  try {
    await webPush.sendNotification(
      subscription,
      JSON.stringify({ title, body }),
    );
    console.log(
      "[Push Service: Send Notification] Sent notification",
      title,
      body,
    );
  } catch (e) {
    console.error(
      "[Push Service: Send Notification] Error sending notification",
      e,
      address,
      title,
      body,
    );
  }
};

createNetwork().then((network) => {
  sendNotifications(network, sendNotification);
});

app.listen(port, () => {
  console.log(`[Push Service] Server listening at port ${port}`);
});
