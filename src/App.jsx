import { AnimatePresence, motion } from "framer-motion";
import { GameProvider, useGame } from "./context/GameContext.jsx";
import { BgNumbers, AudioToggle, XPBar, HomeButton } from "./components/SharedUI.jsx";
import Home from "./components/Home.jsx";
import Wonder from "./components/Wonder.jsx";
import Story from "./components/Story.jsx";
import SimulateHub from "./components/Simulate/SimulateHub.jsx";
import PlayHub from "./components/Play/PlayHub.jsx";
import Reflect from "./components/Reflect.jsx";

const PHASE_MAP = {
  home: Home,
  wonder: Wonder,
  story: Story,
  simulate: SimulateHub,
  play: PlayHub,
  reflect: Reflect,
};

function Router() {
  const { state } = useGame();

  const Phase = PHASE_MAP[state.phase] ?? Home;

  return (
    <>
      <BgNumbers />
      <AudioToggle />
      <XPBar />
      {state.phase !== "home" && <HomeButton />}

      <div
        style={{
          paddingTop: state.phase === "home" ? 20 : 60,
          paddingBottom: 48,
          minHeight: "100vh",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={state.phase}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{
              duration: 0.35,
              ease: "easeInOut",
            }}
          >
            <Phase />
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}

export default function App() {
  return (
    <GameProvider>
      <Router />
    </GameProvider>
  );
}