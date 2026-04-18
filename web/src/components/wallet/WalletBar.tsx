"use client";

import { base } from "wagmi/chains";
import { useAccount, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { useState } from "react";
import { ConnectSheet } from "./ConnectSheet";

export function WalletBar() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const [sheetOpen, setSheetOpen] = useState(false);

  const wrong = isConnected && chainId !== base.id;

  return (
    <>
      <header className="relative z-20 flex w-full max-w-lg flex-col gap-2 px-3 pt-3">
        {wrong ? (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-400/50 bg-amber-500/10 px-3 py-2 text-xs font-mono text-amber-100"
          >
            <span>Wrong network — switch to Base to use on-chain check-in.</span>
            <button
              type="button"
              disabled={isSwitching}
              onClick={() => switchChain({ chainId: base.id })}
              className="shrink-0 rounded border border-amber-300/60 px-2 py-1 text-[11px] uppercase tracking-wide text-amber-50 hover:bg-amber-500/20 disabled:opacity-50"
            >
              {isSwitching ? "Switching…" : "Switch to Base"}
            </button>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-2 rounded-xl border border-cyan-500/30 bg-black/40 px-3 py-2 shadow-[inset_0_0_20px_rgba(0,255,255,0.06)] backdrop-blur-sm">
          <div className="min-w-0 flex-1 font-mono text-[11px] text-cyan-100/90">
            {isConnected && address ? (
              <span className="truncate block">
                {address.slice(0, 6)}…{address.slice(-4)}
              </span>
            ) : (
              <span className="text-cyan-200/70">Not connected</span>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            {isConnected ? (
              <button
                type="button"
                onClick={() => disconnect()}
                className="rounded-lg border border-fuchsia-500/40 px-2 py-1 text-[11px] font-mono uppercase tracking-wide text-fuchsia-100 hover:bg-fuchsia-500/10"
              >
                Disconnect
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                className="rounded-lg border border-lime-400/50 bg-lime-400/10 px-3 py-1.5 text-[11px] font-mono uppercase tracking-wide text-lime-100 shadow-[0_0_12px_rgba(190,255,80,0.25)] hover:bg-lime-400/20"
              >
                Connect wallet
              </button>
            )}
          </div>
        </div>
      </header>
      <ConnectSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}
