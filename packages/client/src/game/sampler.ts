import { Sampler } from "tone";

const createSampler = () => {
  const sampler = new Sampler({
    urls: {
      G1: "8bit-g1.wav",
      G3: "8bit-g3.wav",
    },
    baseUrl: "/assets/audio/",
  }).toDestination();

  const triggerAttackRelease = (notes: string[] | string, duration: number) => {
    if (!sampler.loaded || sampler.context.state !== "running") {
      console.warn("[Sampler] Sampler not ready");
      return;
    }
    sampler.triggerAttackRelease(notes, duration);
  };

  return { triggerAttackRelease, context: sampler.context };
};

const sampler = createSampler();

export default sampler;
