# Game Development Sim (Base)

Mobile-first **merge puzzle** (“studio field” swipes) with cyberpunk neon UI, **wagmi/viem** on **Base** + **Ethereum mainnet** (for reliable `switchChain`), **daily on-chain check-in** via Foundry `DailyCheckIn`, and **Builder Code** attribution via `ox` (`Attribution.toDataSuffix`).

## Layout

- **`web/`** — Next.js App Router (Vercel **Root Directory** = `web`).
- **`contracts/`** — Foundry `DailyCheckIn.sol` + tests (`forge test`).
- **Static assets** — `web/public/app-icon.jpg` (1024×1024, &lt;1MB), `web/public/app-thumbnail.jpg` (1.91:1, &lt;1MB).

## Environment

Copy [`web/.env.example`](web/.env.example) to `web/.env.local` and fill values. Required for production:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS` | Deployed `DailyCheckIn` on Base |
| `NEXT_PUBLIC_BASE_APP_ID` | Base.dev app id (`<meta name="base:app_id" />`) |
| `NEXT_PUBLIC_BUILDER_CODE` | `bc_…` from Base.dev → Settings → Builder Code |

Optional: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`, `NEXT_PUBLIC_BUILDER_CODE_SUFFIX` (hex).

## Contracts

**Always run `forge` from the repo root** — the directory that contains [`foundry.toml`](foundry.toml) (not from `contracts/` alone). If the path has spaces, **quote it** in `cd`, e.g. `cd "/Users/you/Game Development Sim"`.

```bash
cd "/path/to/Game Development Sim"
forge test
```

Deploy `DailyCheckIn` to Base mainnet (set `PRIVATE_KEY` in your environment; never commit it):

```bash
cd "/path/to/Game Development Sim"
forge create contracts/DailyCheckIn.sol:DailyCheckIn \
  --rpc-url https://mainnet.base.org \
  --private-key "$PRIVATE_KEY" \
  --broadcast
```

Common mistakes:

| Wrong | Right |
|-------|--------|
| `src/CheckIn.sol` or `src/DailyCheckIn.sol` | `contracts/DailyCheckIn.sol:DailyCheckIn` (this project’s `src` folder is named `contracts`) |
| `CheckIn.sol` | `DailyCheckIn.sol` |
| `cd Game Development Sim/contracts` then `forge create …` | `cd` to **repo root** (where `foundry.toml` is), then run `forge create` |
| `cd /Users/.../Game Development Sim/contracts` without quotes | Quote the path: `cd "/Users/.../Game Development Sim"` |

Copy the deployed address into `NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS` in Vercel / `web/.env.local`.

Current production deployment (Base mainnet): `0x216068995d278D7637D41bF344237C1dfefA8eFE` ([Basescan](https://basescan.org/address/0x216068995d278D7637D41bF344237C1dfefA8eFE)).

`checkIn()` rejects `msg.value != 0` and allows **one check-in per calendar day**; streak increments on consecutive days. `lastCheckInDay` stores `dayIndex + 1` so “never checked” stays unambiguous.

## Web app

```bash
cd web
npm install
npm run test
npm run build
npm run dev
```

## Base App (standard web)

- No Farcaster mini-app SDK; use **wallet + wagmi** as in [Migrate to a Standard Web App](https://docs.base.org/apps/quickstart/migrate-to-standard-web-app).
- **Builder Codes**: [`dataSuffix` via `ox`](https://docs.base.org/apps/builder-codes/app-developers) on wagmi `createConfig` and on `writeContract` where needed.

## Image export (reference)

Icon: square crop to shortest side, then uniform scale to 1024×1024, JPEG. Thumbnail: crop to **1.91:1**, export JPEG &lt;1MB. Example (macOS `sips`): verify with `sips -g pixelWidth -g pixelHeight file.jpg`.
