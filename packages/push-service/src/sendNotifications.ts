import {
  createWorld,
  defineComponentSystem,
  getComponentEntities,
  getComponentValue,
  getComponentValueStrict,
} from "@latticexyz/recs";
import { SyncStep } from "@latticexyz/store-sync";
import { decodeEntity, encodeEntity } from "@latticexyz/store-sync/recs";
import { Address, getAddress } from "viem";

import config from "./contracts/out/Config.sol/Config.json";
import { Network } from "./network/createNetwork";

type RewardNotif = {
  rewarders: Address[];
  lastNotif: Date;
};

const getContractConfigValue = (name: string): string => {
  const node = config.ast.nodes.find((node) => node.name === name);
  if (!node) {
    throw Error(`No node with name ${name} found in config`);
  }
  const value = node.value?.value;
  if (value === undefined) {
    throw Error(`Node with name ${name} has no value`);
  }
  return value;
};

const parseWadSolidityNotation = (value: string): number => {
  const [num] = value.split("e");
  return Number(num);
};

const BLOCKS_PER_INTERVAL = parseWadSolidityNotation(
  getContractConfigValue("BLOCKS_PER_INTERVAL"),
);

const CANVAS_GROWTH_ROOT = parseWadSolidityNotation(
  getContractConfigValue("WAD_CANVAS_GROWTH_ROOT"),
);

const REWARD_NOTIF_MAX_FREQUENCY = 1000 * 60 * 20; // 10 minutes
const DRAW_OVER_NOTIF_MAX_FREQUENCY = 1000 * 5; // 5 seconds

const isWithinNotifFrequency = (lastNotif: Date, frequencyMs: number) => {
  const now = new Date();
  return now.getTime() - lastNotif.getTime() < frequencyMs;
};

const truncate = (str: string, n: number) => {
  return str.length > n ? str.slice(0, n - 1) + "..." : str;
};

const sendNotifications = (
  network: Network,
  sendNotification: (address: Address, title: string, body: string) => void,
) => {
  const {
    components: { Canvas, PeriodRewardTotal, Name, SyncProgress },
  } = network;

  const world = createWorld();

  const names = new Map<Address, string>();
  defineComponentSystem(world, Name, (update) => {
    const { entity, value } = update;
    const name = value[0]?.value;
    if (!name) return;
    const address = getAddress(
      decodeEntity(Name.metadata.keySchema, entity).artist,
    );
    names.set(address, name);
  });

  let notifsEnabled = false;
  defineComponentSystem(world, SyncProgress, (update) => {
    const { value } = update;
    const progress = value[0]?.step as SyncStep | undefined;
    if (!progress) return;
    if (progress === SyncStep.LIVE)
      setTimeout(() => {
        if (notifsEnabled) return;
        notifsEnabled = true;
        console.log(
          "[Push Service: Reward] Initial Sync complete and notifications enabled",
        );
      }, 5000);
  });

  const getRewardNotifCopy = (
    rewarders: Address[],
  ): { title: string; body: string } => {
    const rewarderNames = rewarders.map(
      (rewarder) => names.get(rewarder) ?? truncate(rewarder, 5),
    );
    const rewarderNamesString = rewarderNames.join(", ");
    const title = `💰 ${rewarders.length} artist${
      rewarders.length > 1 ? "s" : ""
    } rewarded you`;
    const body = truncate(
      `Claim your rewards from ${rewarderNamesString}`,
      500,
    );
    return { title, body };
  };

  const rewardNotifs = new Map<Address, RewardNotif>();

  const processReward = (artist: Address, rewarder: Address) => {
    if (artist === rewarder) return;
    const rewardNotif = rewardNotifs.get(artist);
    if (
      rewardNotif &&
      isWithinNotifFrequency(rewardNotif.lastNotif, REWARD_NOTIF_MAX_FREQUENCY)
    ) {
      rewardNotif.rewarders.push(rewarder);
      return;
    }
    const rewarders = [
      ...new Set([
        ...(rewardNotif ? rewardNotif.rewarders : [rewarder]),
        rewarder,
      ]),
    ];
    const copy = getRewardNotifCopy(rewarders);
    sendNotification(artist, copy.title, copy.body);
    rewardNotifs.set(artist, {
      rewarders: [],
      lastNotif: new Date(),
    });
  };

  defineComponentSystem(
    world,
    Canvas,
    (update) => {
      if (!notifsEnabled) return;
      const { value } = update;
      // TODO: Only calls on artist update, but breaks for drawing over yourself
      if (value[0]?.artist == value[1]?.artist) return;
      const moveArtistRaw = value[0]?.artist;
      const artists: Set<Address> = new Set(
        [...getComponentEntities(Canvas)].map((entity) =>
          getAddress(getComponentValueStrict(Canvas, entity).artist),
        ),
      );
      if (!moveArtistRaw) return;
      const moveArtist = getAddress(moveArtistRaw);
      artists.delete(moveArtist);
      console.log(
        `[Push Service: Reward] Processing reward for ${artists.size} artists`,
      );
      artists.forEach((artist) => processReward(artist, moveArtist));
    },
    { runOnInit: false },
  );

  const getDrawOverCopy = (
    newArtist: Address,
  ): { title: string; body: string } => {
    const title = `⚔️ ${
      names.get(newArtist) ?? truncate(newArtist, 5)
    } drew over you`;
    const body = "Draw more to continue earning rewards";
    return { title, body };
  };

  const drawOverNotifs = new Map<Address, Date>();

  const processDrawOver = (prevArtist: Address, newArtist: Address) => {
    const { title, body } = getDrawOverCopy(newArtist);
    const prevArtistNotif = drawOverNotifs.get(prevArtist);
    if (
      prevArtistNotif &&
      isWithinNotifFrequency(prevArtistNotif, DRAW_OVER_NOTIF_MAX_FREQUENCY)
    )
      return;
    drawOverNotifs.set(prevArtist, new Date());
    sendNotification(prevArtist, title, body);
  };

  defineComponentSystem(
    world,
    Canvas,
    (update) => {
      if (!notifsEnabled) return;
      const { value } = update;
      const prevArtist = value[1]?.artist;
      const newArtist = value[0]?.artist;
      if (!prevArtist || !newArtist) return;
      if (prevArtist === newArtist) return;
      processDrawOver(getAddress(prevArtist), getAddress(newArtist));
    },
    { runOnInit: false },
  );

  const processPeriodChanged = () => {
    const title = "🎨 The canvas got larger";
    const body = "Be the first to draw on new empty space";
    // Send notifs to all addresses
    console.log(
      "[Push Service: Reward] Processing period changed, notifying all addresses",
    );
    const artists: Set<Address> = new Set(
      [...getComponentEntities(Canvas)].map((entity) =>
        getAddress(getComponentValueStrict(Canvas, entity).artist),
      ),
    );
    artists.forEach((artist) => sendNotification(artist, title, body));
  };

  let period = 0;
  network.latestBlock$.subscribe((block) => {
    if (!notifsEnabled) return;
    const blockNumber = Number(block.number);
    const blockDiff = blockNumber - Number(network.initialBlockNumber);
    const intervals = blockDiff / BLOCKS_PER_INTERVAL;
    const currentPeriod = Math.floor(
      Math.pow(intervals, 1 / CANVAS_GROWTH_ROOT),
    );
    if (currentPeriod != period) {
      period = currentPeriod;
      // Sanity check nobody has played yet
      const periodEntity = encodeEntity(PeriodRewardTotal.metadata.keySchema, {
        period: currentPeriod,
      });
      const totalRewardValue = getComponentValue(
        PeriodRewardTotal,
        periodEntity,
      );
      if (totalRewardValue === undefined) {
        processPeriodChanged();
      }
    }
  });
};

export default sendNotifications;
