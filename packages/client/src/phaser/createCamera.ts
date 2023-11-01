// Need no-explicit-any because of rex-gestures

/* eslint-disable @typescript-eslint/no-explicit-any */
import Pinch from "phaser3-rex-plugins/plugins/input/gestures/pinch/Pinch";
import Rotate from "phaser3-rex-plugins/plugins/input/gestures/rotate/Rotate";
import { BehaviorSubject } from "rxjs";

const createCamera = (
  camera: Phaser.Cameras.Scene2D.Camera,
  minZoom: number,
  maxZoom: number
) => {
  const worldView$ = new BehaviorSubject<Phaser.Geom.Rectangle>(
    camera.worldView
  );
  const zoom$ = new BehaviorSubject<number>(camera.zoom);

  const scene = camera.scene;

  const rotate: Rotate = (scene as any).rexGestures.add.rotate();
  rotate.on(
    "rotate",
    ({ drag1Vector: { x, y } }: { drag1Vector: { x: number; y: number } }) => {
      const zoom = camera.zoom;
      camera.setScroll(
        camera.scrollX - x / 2 / zoom,
        camera.scrollY - y / 2 / zoom
      );
    }
  );

  const pinch: Pinch = (scene as any).rexGestures.add.pinch();
  pinch.on("pinch", ({ scaleFactor }: { scaleFactor: number }) => {
    const zoom = camera.zoom * scaleFactor;
    if (zoom < minZoom || zoom > maxZoom) {
      return;
    }
    camera.setZoom(zoom);
    zoom$.next(zoom);
  });

  return { worldView$, zoom$, phaserCamera: camera };
};

export default createCamera;
