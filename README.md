# VoteChain – D21 Voting dApp
A full-stack decentralized voting platform built on Solana and the Anchor framework. Implements the D21 (Janeček method) voting logic with a React frontend.

---

## Features
- D21 Voting: Multi-vote system (2–3 positive, optional 1 negative vote)
- Real-time Results: See votes update instantly
- On-Chain Integrity: All poll data and votes secured on Solana
- Create & Close Polls: Fully managed by wallet owners
- Security: Prevents double voting, unauthorized closure, and invalid vote combinations

 ---

## Project Structure

| Folder                                              | Description                           |
|-----------------------------------------------------|---------------------------------------|
| [`/voting_dapp`](./voting_dapp)                     | Anchor Solana smart contract          |
| [`/frontend`](./frontend)                           | React/Next.js web client, wallet connect |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Solana CLI tools (`solana`)
- Anchor (for building smart contracts)
- Phantom wallet (for testing)

### Local Setup

```bash
git clone https://github.com/DeepakParaste/votechain-anchor.git
cd votechain-anchor

# Deploy frontend locally
cd frontend
npm install
npm run dev
```

### On-chain (Anchor)

```bash
cd ../voting_dapp
anchor build
anchor deploy
anchor test
```

---

## Usage
1. **Open the Live Demo**
2. Connect your Solana wallet (Phantom)
3. Create a poll (min 3, max 8 candidates, configure votes)
4. Cast votes using plus/minus buttons
5. Close poll as creator, view on-chain results forever

---

## Smart Contract Overview

- Accounts: `PollCounter`, `Poll`, `VoteRecord` (all use Solana PDAs)
- Prevents double voting & unauthorized actions
- Rust (Anchor) code in `/voting_dapp`

---

## Tech Stack

- Solana, Anchor, Rust
- React, Next.js, Vercel
- Phantom Wallet Adapter

---

## License

MIT

---
