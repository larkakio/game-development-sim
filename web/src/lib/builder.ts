import { Attribution } from "ox/erc8021";
import type { Hex } from "viem";

/**
 * ERC-8021 data suffix for Builder Code attribution (Base docs).
 * Optional override for rare cases (hex suffix from env).
 */
export function getBuilderDataSuffix(): Hex | undefined {
  const rawOverride = process.env.NEXT_PUBLIC_BUILDER_CODE_SUFFIX;
  if (rawOverride && rawOverride.startsWith("0x")) {
    return rawOverride as Hex;
  }
  const code = process.env.NEXT_PUBLIC_BUILDER_CODE;
  if (!code || code.length < 2) return undefined;
  return Attribution.toDataSuffix({ codes: [code] });
}
