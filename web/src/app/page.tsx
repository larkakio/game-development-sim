import { WalletBar } from "@/components/wallet/WalletBar";
import { CheckInPanel } from "@/components/checkin/CheckInPanel";
import { GameDevelopmentSim } from "@/components/game/GameDevelopmentSim";

export default function Home() {
  return (
    <main className="flex w-full flex-1 flex-col items-center pb-10 pt-2">
      <WalletBar />
      <GameDevelopmentSim />
      <CheckInPanel />
      <footer className="mt-6 max-w-lg px-4 text-center font-mono text-[10px] text-cyan-600/80">
        Built for Base — standard web + wallet. English UI.
      </footer>
    </main>
  );
}
