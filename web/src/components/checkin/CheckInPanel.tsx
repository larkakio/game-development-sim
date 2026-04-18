"use client";

import { base } from "wagmi/chains";
import {
  useAccount,
  useChainId,
  useWriteContract,
  useSwitchChain,
} from "wagmi";
import { checkInAbi } from "@/lib/contracts/checkIn";
import { getBuilderDataSuffix } from "@/lib/builder";

const contractAddress = (process.env.NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS ??
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

export function CheckInPanel() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const {
    writeContractAsync,
    isPending: isWriting,
    error,
    reset,
  } = useWriteContract();

  const hasContract =
    contractAddress !== "0x0000000000000000000000000000000000000000";

  async function handleCheckIn() {
    reset();
    const baseId = base.id;
    if (chainId !== baseId) {
      await switchChainAsync({ chainId: baseId });
    }
    const suffix = getBuilderDataSuffix();
    await writeContractAsync({
      address: contractAddress,
      abi: checkInAbi,
      functionName: "checkIn",
      chainId: baseId,
      ...(suffix ? { dataSuffix: suffix } : {}),
    });
  }

  const busy = isWriting || isSwitching;
  const disabled = !isConnected || !hasContract || busy;

  return (
    <section className="mt-4 w-full max-w-lg rounded-2xl border border-lime-400/25 bg-gradient-to-br from-lime-500/5 to-transparent p-4 shadow-[inset_0_0_24px_rgba(180,255,100,0.06)]">
      <h3 className="font-[family-name:var(--font-display)] text-sm tracking-[0.2em] text-lime-200/90">
        Daily check-in
      </h3>
      <p className="mt-1 font-mono text-[11px] leading-relaxed text-lime-100/50">
        One on-chain check-in per calendar day on Base. You only pay L2 gas — no ETH sent
        to the contract.
      </p>
      {!hasContract ? (
        <p className="mt-2 font-mono text-xs text-amber-200/80">
          Set <code className="text-cyan-200/90">NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS</code>{" "}
          after deploying the contract.
        </p>
      ) : null}
      <button
        type="button"
        disabled={disabled}
        onClick={() => void handleCheckIn()}
        className="mt-3 w-full rounded-xl border border-lime-400/40 bg-lime-400/10 py-3 font-mono text-sm uppercase tracking-widest text-lime-100 shadow-[0_0_20px_rgba(190,255,120,0.15)] hover:bg-lime-400/20 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? "Confirm in wallet…" : "Check in on Base"}
      </button>
      {error ? (
        <p className="mt-2 font-mono text-xs text-rose-300/90">{error.message}</p>
      ) : null}
    </section>
  );
}
