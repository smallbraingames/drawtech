import { usePrivy } from "@privy-io/react-auth";

import logo from "../../public/assets/logo.png";
import { TERMS_OF_SERVICE } from "./config";

const Login = () => {
  const { login } = usePrivy();

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center">
      <div className="flex flex-col gap-12">
        <div className="flex gap-1 tracking-tight">
          <div className="w-6 h-6">
            <img src={logo} className="object-fit" />
          </div>
          <div className="font-bold text-xl">
            <span className="text-yellow-800">DRAW</span>.TECH
          </div>
        </div>

        <div>An fully onchain drawing game</div>

        <div className="w-72 tracking-tight text-xs bg-stone-300 p-2">
          This is beta software that is an interface to (open source, verified)
          smart contracts not known to have been audited. Use at your own risk.
        </div>

        <div className="flex flex-col gap-4">
          <div className="h-12 select-none">
            <div
              className="bg-yellow-400 text-yellow-800 border border-r-2 border-b-4 border-yellow-800 font-bold tracking-tight p-2 text-xl rounded-sm w-72 text-center active:border"
              onClick={login}
            >
              <button>SIGN IN</button>
            </div>
          </div>
          <div className="w-72 tracking-tight text-xs bg-yellow-100 p-2">
            By clicking SIGN IN, you agree to the{" "}
            <a className="underline" href={TERMS_OF_SERVICE}>
              Terms of Service.
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
