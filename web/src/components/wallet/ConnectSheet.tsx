"use client";

import { base } from "wagmi/chains";
import { useConnect, useConnectors } from "wagmi";
import { useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function ConnectSheet({ open, onClose }: Props) {
  const connectors = useConnectors();
  const { connectAsync, isPending, error } = useConnect();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Choose wallet"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="max-h-[min(70vh,520px)] w-full max-w-md overflow-y-auto rounded-t-2xl border border-cyan-500/35 bg-[#070a12] p-4 shadow-[0_-8px_40px_rgba(0,255,255,0.12)] sm:rounded-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-lg tracking-wide text-cyan-100">
            Connect wallet
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-white/10 px-2 py-0.5 font-mono text-xs text-white/70 hover:bg-white/5"
          >
            Close
          </button>
        </div>
        <p className="mb-3 font-mono text-[11px] leading-relaxed text-cyan-200/60">
          Pick a wallet. You will be prompted on Base (chain {base.id}) when possible.
        </p>
        <ul className="flex flex-col gap-2">
          {connectors.map((c) => (
            <li key={c.uid}>
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  void connectAsync({ connector: c, chainId: base.id }).then(
                    () => onClose(),
                  )
                }
                className="flex w-full items-center justify-between rounded-xl border border-cyan-500/25 bg-cyan-500/5 px-4 py-3 text-left font-mono text-sm text-cyan-50 transition hover:border-cyan-400/50 hover:bg-cyan-500/10 disabled:opacity-50"
              >
                <span>{c.name}</span>
                <span className="text-[10px] uppercase text-cyan-300/50">Connect</span>
              </button>
            </li>
          ))}
        </ul>
        {error ? (
          <p className="mt-3 font-mono text-xs text-rose-300/90">{error.message}</p>
        ) : null}
      </div>
    </div>
  );
}
