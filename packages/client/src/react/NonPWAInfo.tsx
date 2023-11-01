import logo from "../../public/assets/logo.png";
import getIsIOS from "../pwa/getIsIOS";
import getIsMobile from "../pwa/getIsMobile";

const IOS_MESSAGE = () => (
  <p>
    In your Safari browser menu, tap the Share icon and choose{" "}
    <strong> Add to Home Screen </strong> in the options. Then open the
    draw.tech app on your home screen.{" "}
  </p>
);

const NON_MOBILE_MESSAGE = () => (
  <p>
    draw.tech is only on mobile <br />
    Visit on your phone to play
  </p>
);

const ANDROID_MESSAGE = () => (
  <p>
    {" "}
    In your Chrome browser menu, tap the <strong>
      {" "}
      Add to Home Screen{" "}
    </strong>{" "}
    option. Then open the draw.tech app on your home screen.{" "}
  </p>
);

const NonPWAInfo = () => {
  const isMobile = getIsMobile();
  const isIOS = getIsIOS();

  return (
    <div className="absolute top-0 left-0 h-screen w-screen bg-stone-50 flex items-center justify-center tracking-tight text-stone-800">
      <div className="w-96 flex flex-col items-center">
        <div className="flex flex-col gap-8 items-center justify-center">
          <img src={logo} className="object-contain h-20 w-20 animate-bounce" />
          <div className="flex flex-col gap-2 justify-center items-center">
            <p className="text-xl font-bold">
              <span className="text-yellow-800">DRAW</span>.TECH
            </p>
            <p className="text-stone-600 tracking-tight">
              An onchain drawing game
            </p>
          </div>
        </div>
        <div className="h-[15vh]" />
        {isMobile && (
          <p className="font-bold mb-2 text-xl">Add to Home Screen to Play</p>
        )}
        <div className="flex flex-col items-center justify-center bg-stone-200 rounded-md w-fit p-4 mx-4">
          <div className="text-left">
            {!isMobile ? (
              <NON_MOBILE_MESSAGE />
            ) : isIOS ? (
              <IOS_MESSAGE />
            ) : (
              <ANDROID_MESSAGE />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NonPWAInfo;
