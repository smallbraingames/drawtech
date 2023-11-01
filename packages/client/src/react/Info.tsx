import { SAFETY_STANDARDS, TERMS_OF_SERVICE } from "./config";

const FAQItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => (
  <p>
    <span className="font-bold"> {question} </span>
    <br />
    {answer}
  </p>
);

const Info = () => {
  return (
    <div className="bg-stone-100 rounded-sm tracking-tight overflow-y-scroll h-full mx-8">
      <div className="flex flex-col gap-4 items-center bg-stone-100 rounded-sm tracking-tight p-4 overflow-y-scroll ">
        <div className="flex flex-col gap-1 text-md w-full text-lg">
          <h1 className="text-lg font-bold text-center mb-2">RULES</h1>
          <p>👉 Tap anywhere to draw</p>
          <p>🏷️ Tile prices change with demand </p>
          <p>💰 Earn rewards when others draw </p>
          <p>⚔️ Draw over someone to take their tiles</p>
        </div>
        <div className="flex flex-col gap-2 text-md w-full">
          <h1 className="text-lg font-bold text-center">FAQ</h1>
          <FAQItem
            question={"How are rewards distributed?"}
            answer={
              "You earn rewards whenever others add to the canvas. Rewards are distributed proportionally to the number of tiles you own."
            }
          />
          <FAQItem
            question={"How do prices change?"}
            answer={
              "Prices change with demand. If more artists draw over a tile, the price of that tile rises. Over time, if not drawn over, the price of a tile will fall. The pricing mechanic is a linear VRGDA (Variable Rate Gradual Dutch Auction)."
            }
          />
          <FAQItem
            question={"Does the canvas grow?"}
            answer={
              "Yes, the canvas will slowly expand. Turn notifications on to be alerted when the canvas grows. If you are the first to draw on a new tile, you claim extra rewards!"
            }
          />
          <FAQItem
            question={"Are there fees?"}
            answer={
              "A 6.23% fee is taken when you draw. The fee is only taken if you use this client–you may an alternative client or the contracts directly to avoid the fee. This client is open source as well."
            }
          />
          <FAQItem
            question={"What is the best strategy?"}
            answer={
              "There are many strategies. But it is always better to make contributions that others want to keep."
            }
          />
          <FAQItem
            question={"What happens if someone draws over me?"}
            answer={
              "If someone draws over you, you will lose ownership of those tiles and stop earning rewards for them."
            }
          />
        </div>
        <div className="flex flex-col gap-2 text-md w-full">
          <h1 className="text-lg font-bold text-center">TERMS</h1>
          By using this site (and when you clicked SIGN IN earlier), you are
          agreeing & have agreed to the following{" "}
          <a href={TERMS_OF_SERVICE} className="underline">
            terms and conditions.
          </a>
          You also acknowledge that this application is a utility that crafts
          transactions to a peer-to-peer protocol on the Base blockchain. We do
          not custody any assets you own, and we do not have the ability to
          reverse transactions. You are responsible for your own actions. Open
          source smart contracts for this application and the smart contracts
          associated with it can be found here. Small Brain Games also has
          strict{" "}
          <a className="underline" href={SAFETY_STANDARDS}>
            safety standards
          </a>{" "}
          we abide by, which apply to this application as well.
        </div>
      </div>
    </div>
  );
};

export default Info;
