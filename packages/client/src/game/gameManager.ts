import {
  Entity,
  Has,
  Metadata,
  Schema,
  Type,
  defineComponent,
  defineComponentSystem,
  getComponentValue,
  getComponentValueStrict,
  runQuery,
  setComponent,
  updateComponent,
} from "@latticexyz/recs";
import { SyncStep } from "@latticexyz/store-sync";
import {
  decodeEntity,
  encodeEntity,
  singletonEntity,
} from "@latticexyz/store-sync/recs";
import { Coord, awaitStreamValue } from "@latticexyz/utils";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { BehaviorSubject, throttleTime } from "rxjs";
import {
  Address,
  Hex,
  formatEther,
  getAddress,
  getContract,
  zeroAddress,
} from "viem";
import { getAccount, getWalletClient } from "wagmi/actions";

import createNetwork, { Network } from "../network/createNetwork";
import world from "../network/world";
import {
  FEE_TAKER_ADDRESS,
  INITIAL_CANVAS_DIM,
  START_SELECTION_COLOR,
  getFee,
} from "./config";
import ControlState from "./controlState";
import getCanvasDim from "./getCanvasDim";
import getCoordsIterator from "./getCoordsIterator";
import getCryptocompareETHUSDExchangeRate from "./getCryptocompareETHUSDExchangeRate";
import getPeriod from "./getPeriod";
import getPrice from "./getPrice";
import { Unit } from "./unit";

const COORD_ENTITY_PREFIX = "coord";
const ARTIST_ENTITY_PREFIX = "artist";
const DELIMITER = ";";

export type GameComponents = ReturnType<typeof createGameComponents>;
export type GameApi = ReturnType<typeof createApi>;

const createGameComponents = () => {
  const getCoordEntity = (coord: Coord): Entity =>
    `${COORD_ENTITY_PREFIX}${DELIMITER}${coord.x}${DELIMITER}${coord.y}` as Entity;

  const getEntityCoord = (entity: Entity): Coord => {
    const [, x, y] = entity.split(DELIMITER);
    return { x: Number(x), y: Number(y) };
  };

  const getArtistEntity = (artist: Address) =>
    `${ARTIST_ENTITY_PREFIX}${DELIMITER}${artist}` as Entity;

  const getEntityArtist = (entity: Entity): Address => {
    const [, artist] = entity.split(DELIMITER);
    return artist as Address;
  };

  const gameComponents = {
    Color: defineComponent(
      world,
      {
        value: Type.Number,
      },
      { id: "gc-color" }
    ),
    Artist: defineComponent<Schema, Metadata, Address>(
      world,
      {
        value: Type.T,
      },
      { id: "gc-artist" }
    ),
    Name: defineComponent(world, { value: Type.String }, { id: "gc-name" }),
    NumSold: defineComponent(
      world,
      {
        value: Type.Number,
      },
      { id: "gc-num-sold" }
    ),
    Price: defineComponent(
      world,
      {
        value: Type.Number,
      },
      { id: "gc-price" }
    ),
    Period: defineComponent(
      world,
      {
        value: Type.Number,
      },
      { id: "gc-period" }
    ),
    UnclaimedRewards: defineComponent(
      world,
      {
        value: Type.BigInt,
      },
      {
        id: "gc-unclaimed-rewards",
      }
    ),
    ClaimedRewards: defineComponent(
      world,
      {
        value: Type.BigInt,
      },
      {
        id: "gc-claimed-rewards",
      }
    ),
    SelectedColor: defineComponent(
      world,
      {
        value: Type.Number,
      },
      { id: "gc-selected-color" }
    ),
    Drawing: defineComponent(
      world,
      {
        value: Type.Number,
      },
      { id: "gc-drawing" }
    ),
    ControlState: defineComponent<Schema, Metadata, ControlState>(
      world,
      {
        value: Type.T,
      },
      { id: "gc-control-state" }
    ),
    Selected: defineComponent<Schema, Metadata, Entity>(
      world,
      { value: Type.T },
      { id: "gc-selected" }
    ),
    InitialSyncComplete: defineComponent(
      world,
      { value: Type.Boolean },
      { id: "gc-initial-sync-complete" }
    ),
    Settings: defineComponent(
      world,
      { displayUnitsUSD: Type.Boolean, ethUSDExchangeRate: Type.Number },
      { id: "gc-settings" }
    ),
    latestBlock$: new BehaviorSubject<number>(0),
    initialBlockNumber: 0,
  };

  return {
    ...gameComponents,
    getCoordEntity,
    getEntityCoord,
    getArtistEntity,
    getEntityArtist,
  };
};

const createApi = () => {
  let network: Network | undefined;

  const setNetwork = (liveNetwork: Network) => {
    network = liveNetwork;
  };

  const getSpentOverLastDay = async (
    network: Network,
    senderAddress: Address
  ): Promise<bigint | undefined> => {
    const {
      components: { Spent },
      latestBlock$,
    } = network;
    const currentBlockNumber = Number(
      (await awaitStreamValue(latestBlock$)).number ?? 0n
    );
    if (currentBlockNumber === 0) return undefined;
    const startingBlockNumber = currentBlockNumber - 24 * 60 * 30; // Approx block time of 2s/block
    const spent = [...Spent.entities()]
      .map((entity) => {
        const value = getComponentValueStrict(Spent, entity);
        const address = getAddress(
          decodeEntity(Spent.metadata.keySchema, entity).artist
        );
        return {
          address,
          value: value.value,
          blockNumber: value.blockNumber,
        };
      })
      .filter(
        ({ blockNumber, address }) =>
          blockNumber >= startingBlockNumber && address === senderAddress
      )
      .reduce((acc, { value }) => acc + value, 0n);
    console.log("[Api] Spent over last day", spent);
    return spent;
  };

  const getWorldContract = async (network: Network) => {
    const {
      networkConfig: {
        chain: { id: chainId },
        worldAddress,
      },
      publicClient,
    } = network;
    const walletClient = await getWalletClient({
      chainId: chainId,
    });
    if (walletClient?.account === undefined) {
      console.warn("[Create Api] Wallet client is undefined", walletClient);
      return undefined;
    }
    await walletClient.switchChain({ id: chainId });
    const artistAddress = walletClient.account.address;

    // RUN COMPLIANCE CHECK
    const isCompliant = (
      await (
        await fetch("/api/isAddressCompliant", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address: artistAddress }),
        })
      ).json()
    ).isCompliant;
    if (!isCompliant) {
      console.warn(
        "[Create Api] Address is not compliant, not returning contract",
        artistAddress
      );
      return undefined;
    }

    const worldContract = getContract({
      address: worldAddress as Hex,
      abi: IWorldAbi,
      publicClient,
      walletClient,
    });
    return worldContract;
  };

  const getGasEstimate = async (
    move: Unit[],
    valueWei: bigint
  ): Promise<bigint> => {
    if (!network) {
      throw Error("[Api] Network is undefined");
    }
    const worldContract = await getWorldContract(network);
    if (!worldContract) {
      console.warn("[Api] World contract is undefined");
      return 0n;
    }
    const gasEstimate = await worldContract.estimateGas.draw([move], {
      value: valueWei,
    });
    return gasEstimate;
  };

  const draw = async (move: Unit[], valueWei: bigint) => {
    if (!network) {
      console.warn("[Api] Network is undefined");
      return;
    }
    const {
      waitForTransaction,
      networkConfig: { chain },
    } = network;

    // RUN VALUE CHECK, FAIL IF VALUE > $250
    const priceConversion = await getCryptocompareETHUSDExchangeRate();
    const priceUSD = Number(formatEther(valueWei)) * priceConversion;
    if (priceUSD > 250) {
      console.warn("[Api] Value above $250 threshold");
      return;
    }

    // RUN SPENT CHECK, FAIL IF > $1000 SPENT
    const address = getAccount().address;
    if (address === undefined) {
      console.warn("[Create Api] Address is undefined", address);
      return;
    }
    const spentOverDay = await getSpentOverLastDay(network, address);
    if (spentOverDay === undefined) {
      console.warn("[Create Api] Spent over day is undefined");
      return undefined;
    }
    const usdSpent = Number(formatEther(spentOverDay)) * priceConversion;
    if (usdSpent > 1000) {
      console.warn("[Api] Spent above $1000 threshold");
      return;
    }

    console.log("[Api] Compliance checks passed, drawing", usdSpent, priceUSD);

    const fee = getFee(valueWei);
    const tx = await (
      await getWorldContract(network)
    )?.write.drawFee([move, fee, FEE_TAKER_ADDRESS], {
      value: valueWei + fee,
      chain,
    });
    if (!tx) return;
    await waitForTransaction(tx);
  };

  const claimRewards = async (coords: Coord[], artist: Address) => {
    if (!network) {
      console.warn("[Api] Network is undefined");
      return;
    }
    const {
      waitForTransaction,
      networkConfig: { chain },
    } = network;
    const tx = await (
      await getWorldContract(network)
    )?.write.claimRewards([coords, artist], {
      chain,
    });
    if (!tx) return;
    await waitForTransaction(tx);
  };

  const setName = async (name: string) => {
    if (!network) {
      console.warn("[Api] Network is undefined");
      return;
    }
    const {
      waitForTransaction,
      networkConfig: { chain },
    } = network;
    const tx = await (
      await getWorldContract(network)
    )?.write.setName([name], {
      chain,
    });
    if (!tx) return;
    await waitForTransaction(tx);
  };

  return {
    draw,
    claimRewards,
    getGasEstimate,
    setNetwork,
    setName,
  };
};

const getEarliestStartPeriod = (n: number) => {
  const initialCanvasDim = Math.floor(INITIAL_CANVAS_DIM / 2);
  return Math.max(Math.abs(n), initialCanvasDim) - initialCanvasDim;
};

const getCoordStartPeriod = (coord: Coord) => {
  return Math.max(
    getEarliestStartPeriod(coord.x),
    getEarliestStartPeriod(coord.y)
  );
};

const createGameManager = () => {
  const gameComponents = createGameComponents();
  const api = createApi();

  const syncGame = async () => {
    console.log("[Game Component Manager] Syncing game components");
    const network = await createNetwork();
    api.setNetwork(network);
    const {
      Artist,
      Color,
      ControlState: ControlStateComponent,
      Period,
      Price,
      Name,
      NumSold,
      UnclaimedRewards,
      ClaimedRewards,
      InitialSyncComplete,
      SelectedColor,
      Settings,
      getCoordEntity,
      getArtistEntity,
      latestBlock$,
    } = gameComponents;
    const {
      components: {
        Canvas: CanvasNetworkComponent,
        CanvasColor: CanvasColorNetworkComponent,
        InitialBlock: InitialBlockNetworkComponent,
        Name: NameNetworkComponent,
        PeriodRewardTotal: PeriodRewardTotalNetworkComponent,
        Rewards: RewardsNetworkComponent,
        RewardClaim: RewardClaimNetworkComponent,
        SyncProgress: SyncProgressNetworkComponent,
      },
      initialBlockNumber,
      latestBlock$: latestBlockNetwork$,
    } = network;

    gameComponents.initialBlockNumber = Number(initialBlockNumber);
    defineComponentSystem(world, InitialBlockNetworkComponent, (update) => {
      const { value } = update;
      const blockNumber = value[0]?.value ?? 0n;
      gameComponents.initialBlockNumber = Number(blockNumber);
    });

    defineComponentSystem(world, CanvasNetworkComponent, (update) => {
      const { entity: networkEntity, value } = update;
      const coord: Coord = decodeEntity(
        CanvasNetworkComponent.metadata.keySchema,
        networkEntity
      );
      const entity = getCoordEntity(coord);
      const numSold = value[0]?.numSold;
      const artist = value[0]?.artist;
      artist && setComponent(Artist, entity, { value: getAddress(artist) });
      numSold && setComponent(NumSold, entity, { value: numSold });
    });
    defineComponentSystem(world, CanvasColorNetworkComponent, (update) => {
      const { entity: networkEntity, value } = update;
      const coord: Coord = decodeEntity(
        CanvasColorNetworkComponent.metadata.keySchema,
        networkEntity
      );
      const entity = getCoordEntity(coord);
      const color = value[0]?.value;
      color !== undefined && setComponent(Color, entity, { value: color });
    });
    defineComponentSystem(world, NameNetworkComponent, (update) => {
      const { entity: networkEntity, value } = update;
      const artist = getAddress(
        decodeEntity(NameNetworkComponent.metadata.keySchema, networkEntity)
          .artist
      );
      const entity = getArtistEntity(artist);
      const name = value[0]?.value;
      name && setComponent(Name, entity, { value: name });
    });
    defineComponentSystem(world, SyncProgressNetworkComponent, (update) => {
      if (update.value[0]?.step === SyncStep.LIVE) {
        setComponent(InitialSyncComplete, singletonEntity, { value: true });
      } else {
        setComponent(InitialSyncComplete, singletonEntity, { value: false });
      }
    });
    latestBlockNetwork$.subscribe((latestBlock) => {
      const blockNumber = Number(latestBlock.number);
      latestBlock$.next(blockNumber);
      const blockDiff = blockNumber - gameComponents.initialBlockNumber;
      const period = getPeriod(blockDiff);
      if (period !== getComponentValue(Period, singletonEntity)?.value) {
        setComponent(Period, singletonEntity, { value: period });
      }
      const canvasDim = getCanvasDim(period);
      for (const coord of getCoordsIterator(canvasDim)()) {
        const entity = getCoordEntity(coord);
        const numSold = getComponentValue(NumSold, entity)?.value ?? 0;
        const price = getPrice(blockDiff, numSold);
        setComponent(Price, entity, { value: price });
      }
    });

    const updateRewards = () => {
      const currentPeriod = getComponentValue(Period, singletonEntity)?.value;
      if (currentPeriod === undefined) return;
      const canvasDim = getCanvasDim(currentPeriod);
      const unclaimedRewards = new Map<Address, bigint>();
      for (const coord of getCoordsIterator(canvasDim)()) {
        let untrackedCoordRewards = 0n;
        const startPeriod = getCoordStartPeriod(coord);
        for (let i = startPeriod; i <= currentPeriod; i++) {
          const totalPeriodUnits = getCanvasDim(i) ** 2;
          const periodRewardTotal = getComponentValue(
            PeriodRewardTotalNetworkComponent,
            encodeEntity(PeriodRewardTotalNetworkComponent.metadata.keySchema, {
              period: i,
            })
          )?.value;
          untrackedCoordRewards +=
            (periodRewardTotal ?? 0n) / BigInt(totalPeriodUnits);
        }
        const canvasComponent = getComponentValue(
          CanvasNetworkComponent,
          encodeEntity(CanvasNetworkComponent.metadata.keySchema, coord)
        );
        const rewardsTracked = canvasComponent?.totalRewardsTracked ?? 0n;
        untrackedCoordRewards -= rewardsTracked;
        if (canvasComponent?.artist === undefined) continue;
        const artist = getAddress(canvasComponent?.artist);
        if (artist === zeroAddress) continue;
        unclaimedRewards.set(
          artist,
          (unclaimedRewards.get(artist) ?? 0n) + untrackedCoordRewards
        );
      }

      const allRewardArtists = new Set<Address>();
      for (const [artist] of unclaimedRewards) {
        allRewardArtists.add(artist);
      }
      [...runQuery([Has(RewardsNetworkComponent)])].map((entity) => {
        const artist = getAddress(
          decodeEntity(RewardsNetworkComponent.metadata.keySchema, entity)
            .artist
        );
        allRewardArtists.add(artist);
      });

      for (const artist of [...allRewardArtists]) {
        const trackedRewards = getComponentValue(
          RewardsNetworkComponent,
          encodeEntity(RewardsNetworkComponent.metadata.keySchema, { artist })
        )?.value;
        const entity = getArtistEntity(artist);
        const value = unclaimedRewards.get(artist) ?? 0n;
        setComponent(UnclaimedRewards, entity, {
          value: value + (trackedRewards ?? 0n),
        });
      }
    };
    const updateClaimedRewardsTrigger$ = new BehaviorSubject<number>(0);
    defineComponentSystem(world, PeriodRewardTotalNetworkComponent, () =>
      updateClaimedRewardsTrigger$.next(0)
    );
    defineComponentSystem(world, RewardsNetworkComponent, () =>
      updateClaimedRewardsTrigger$.next(0)
    );
    defineComponentSystem(world, CanvasNetworkComponent, () =>
      updateClaimedRewardsTrigger$.next(0)
    );
    updateClaimedRewardsTrigger$
      .pipe(throttleTime(1000, undefined, { leading: false, trailing: true }))
      .subscribe(updateRewards);

    defineComponentSystem(world, RewardClaimNetworkComponent, (update) => {
      const { entity: networkEntity, value } = update;
      const artist = getAddress(
        decodeEntity(
          RewardClaimNetworkComponent.metadata.keySchema,
          networkEntity
        ).artist
      );
      const entity = getArtistEntity(artist);
      const claimedRewards = value[0]?.value;
      const prevClaimedRewards = getComponentValue(
        ClaimedRewards,
        entity
      )?.value;
      claimedRewards &&
        setComponent(ClaimedRewards, entity, {
          value: claimedRewards + (prevClaimedRewards ?? 0n),
        });
    });

    setComponent(Settings, singletonEntity, {
      displayUnitsUSD: true,
      ethUSDExchangeRate: 1700,
    });
    const updateEthUSDExchangeRate = async () => {
      const ethUSDExchangeRate = await getCryptocompareETHUSDExchangeRate();
      updateComponent(Settings, singletonEntity, {
        ethUSDExchangeRate,
      });
    };
    updateEthUSDExchangeRate();
    setInterval(updateEthUSDExchangeRate, 30 * 1000);

    setComponent(SelectedColor, singletonEntity, {
      value: START_SELECTION_COLOR,
    });
    setComponent(ControlStateComponent, singletonEntity, {
      value: ControlState.DRAW,
    });
  };

  return { gameComponents, syncGame, api };
};

const gameManager = createGameManager();

export default gameManager;
