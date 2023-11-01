import sampler from "../game/sampler";
import { NOTE_SEQUENCE } from "../phaser/config";

const ClickSound = ({
  children,
  enabled = true,
  note,
}: {
  children: React.ReactNode;
  enabled?: boolean;
  note?: string[];
}) => {
  const playSound = () => {
    if (!enabled) return;
    const noteToPlay = note
      ? note
      : `${NOTE_SEQUENCE[Math.floor(Math.random() * NOTE_SEQUENCE.length)]}3`;
    sampler.triggerAttackRelease(noteToPlay, 0.1);
  };

  return <div onClick={playSound}>{children}</div>;
};

export default ClickSound;
