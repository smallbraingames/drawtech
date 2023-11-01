import { LuBell, LuLightbulb } from "react-icons/lu";
import { getAccount } from "wagmi/actions";

import logo from "../../public/assets/logo.png";
import initServiceWorker from "../service-worker/initServiceWorker";

const Notifications = ({
  setNotificationPrompt,
}: {
  setNotificationPrompt: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <div className="flex flex-col items-center justify-center bg-stone-100 p-4 rounded-sm mx-4">
      <div className="flex flex-col gap-12">
        <div className="flex gap-1 tracking-tight items-center">
          <div className="w-20 h-20">
            <img src={logo} className="object-fit" />
          </div>
          <div className="w-20 h-20 text-yellow-800">
            <LuBell className="text-7xl" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Enable Reward Notifications</h1>
          <p className="text-sm">
            We'll notify you whenever you earn rewards, or when someone draws
            over your tiles.
          </p>
        </div>

        <div className="bg-stone-200 p-2 flex gap-2 items-center">
          <div>
            <LuLightbulb className="text-3xl text-yellow-600" />
          </div>
          <div className="text-sm">
            You earn rewards when others draw. The more active tiles you have,
            the more rewards you earn.
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={async () => {
              const address = getAccount().address;
              address && initServiceWorker(address);
              setNotificationPrompt(false);
            }}
            className="w-full text-xl p-1 rounded-sm font-bold bg-green-400 text-green-800 border border-b-4 border-r-2 border-green-800 p-1 active:border"
          >
            ENABLE REWARD NOTIFS
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
