const MQ_STAND_ALONE = "(display-mode: standalone)";

const getIsPWA = () => {
  let displayMode = false;
  if (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator as any).standalone ||
    window.matchMedia(MQ_STAND_ALONE).matches
  ) {
    displayMode = true;
  }
  return displayMode;
};

export default getIsPWA;
