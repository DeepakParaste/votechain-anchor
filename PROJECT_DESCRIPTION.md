# Project Description

**Deployed Frontend URL:** [yet to be filled]

**Solana Program ID:** GmVVTa2jWgisJZAwbXHEVttEYxYcHDcLHBBxnD1mUmTq

## Project Overview

### Description

This project implements a D21-inspired voting system on the Solana blockchain. D21 is a democratic voting method (Janeček method) that allows voters to cast multiple positive votes and optionally one negative vote, providing a more nuanced representation of voter preferences compared to traditional single-vote systems.

The dApp enables users to create polls with customizable parameters, cast votes using the D21 methodology, view real-time results, and close polls when voting is complete. All voting data is stored on-chain, ensuring transparency and immutability. The system is designed to prevent common voting vulnerabilities such as double voting, unauthorized poll closure, and voting on inactive polls.

### Key Features

- **Poll Creation:** Users can create polls with 3-8 candidates, custom questions, and configurable voting rules (2-3 plus votes per voter, optional minus votes)
- **D21 Voting Method:** Voters can cast 2 positive votes for their preferred candidates and optionally 1 negative vote against a candidate they oppose
- **Real-time Results:** Vote counts update instantly and are displayed with visual bar charts
- **Poll Management:** Poll creators can close their polls to end voting
- **Security:** Comprehensive validation prevents duplicate votes, invalid candidate selections, and unauthorized actions
- **Transparency:** All votes and poll data are stored on-chain and publicly verifiable

### How to Use the dApp

1. **Connect Wallet**
   - Click the "Connect Wallet" button in the top section
   - Select your Phantom wallet (or another Solana wallet)
   - Approve the connection request

2. **Initialize Poll Counter (First Time Only)**
   - When creating your first poll, the system will automatically initialize a poll counter for your wallet
   - This is a one-time setup that tracks how many polls you've created

3. **Create a Poll**
   - Enter your poll question in the "Poll question" field
   - Fill in at least 3 candidate names (up to 8 supported)
   - Check or uncheck "Allow minus votes" to enable/disable the D21 negative voting feature
   - Click "Create Poll" and approve the transaction
   - Wait for confirmation (usually 2-3 seconds)

4. **Cast a Vote**
   - Find an active poll in the "Your Polls" section
   - Select your first choice from the dropdown
   - Optionally select a second choice
   - If minus votes are enabled, optionally select a candidate to vote against
   - Click "Submit Vote" and approve the transaction
   - Results update automatically after confirmation

5. **Close a Poll**
   - Only the poll creator can close their own polls
   - Click "Close Poll" button on any of your active polls
   - Approve the transaction
   - The poll status changes to "Closed" and no further votes can be cast

## Program Architecture

The Solana program is built using the Anchor framework and implements a voting system with three main account types: PollCounter, Poll, and VoteRecord. The architecture uses Program Derived Addresses (PDAs) for deterministic account generation and ownership verification.

### PDA Usage

PDAs are used extensively to create deterministic, user-specific accounts without requiring private keys. This enables secure account management and prevents unauthorized access.

**PDAs Used:**

- **Poll Counter PDA:** 
  - Seeds: `["poll_counter", creator.key()]`
  - Purpose: Stores the total number of polls created by a user. Used to generate unique poll IDs for each creator. This ensures each user has their own independent poll numbering system.

- **Poll PDA:**
  - Seeds: `["poll", creator.key(), poll_count.to_le_bytes()]`
  - Purpose: Stores individual poll data including question, candidates, vote counts, and settings. The poll_count ensures each poll has a unique address even for the same creator.

- **Vote Record PDA:**
  - Seeds: `["vote_record", poll.key(), voter.key()]`
  - Purpose: Stores a voter's choices for a specific poll. This prevents double voting by making each voter-poll combination unique. If someone tries to vote twice, the transaction fails because the account already exists.

### Program Instructions

**Instructions Implemented:**

- **initialize_poll_counter**
  - Creates a PollCounter account for a new user
  - Initializes poll_count to 0
  - Must be called before creating the first poll
  - Only needs to be called once per user

- **create_poll**
  - Creates a new poll with specified question and candidates
  - Validates that there are 3-8 candidates
  - Sets max_plus_votes (2-3) and allow_minus_vote flag
  - Increments the poll counter
  - Initializes vote_counts array to zeros

- **cast_vote**
  - Records a voter's choices for a poll
  - Accepts vote_option_1 (required), vote_option_2 (optional), and minus_vote_index (optional)
  - Validates that the poll is active
  - Prevents voting for the same candidate twice
  - Prevents minus voting on a candidate you voted for
  - Updates vote counts atomically
  - Creates a VoteRecord to prevent double voting

- **close_poll**
  - Sets a poll's is_active flag to false
  - Only callable by the poll creator
  - Prevents further voting on the poll
  - Does not delete poll data (results remain viewable)

### Account Structure
```rust
// Tracks how many polls a user has created
#[account]
pub struct PollCounter {
    pub creator: Pubkey,      // Wallet address of the poll creator
    pub poll_count: u64,      // Total number of polls created
}

// Stores all data for a single poll
#[account]
pub struct Poll {
    pub creator: Pubkey,           // Wallet address of poll creator
    pub poll_id: u64,              // Sequential ID for this creator
    pub question: String,          // Poll question (max 200 chars)
    pub candidates: Vec<String>,   // List of candidate names (3-8)
    pub vote_counts: Vec<i64>,     // Current vote count for each candidate
    pub total_voters: u64,         // Number of people who voted
    pub is_active: bool,           // Whether voting is still open
    pub created_at: i64,           // Unix timestamp of creation
    pub max_plus_votes: u8,        // How many positive votes allowed (2-3)
    pub allow_minus_vote: bool,    // Whether negative votes are enabled
}

// Stores one voter's choices for one poll
#[account]
pub struct VoteRecord {
    pub voter: Pubkey,             // Wallet address of voter
    pub poll: Pubkey,              // Which poll this vote is for
    pub vote_option_1: u8,         // First positive vote (required)
    pub vote_option_2: Option<u8>, // Second positive vote (optional)
    pub minus_vote: Option<u8>,    // Negative vote (optional)
    pub voted_at: i64,             // Unix timestamp of vote
}
```
## Testing

### Test Coverage

The test suite covers all program instructions with both successful execution paths and error scenarios. Tests are written in TypeScript using Mocha and Chai assertion libraries.

**Happy Path Tests:**

- **Poll counter initialization:** Verifies that a new poll counter is created correctly with poll_count set to 0
- **Poll creation:** Tests creating a poll with valid parameters (4 candidates, 2 max votes, minus votes enabled)
- **Voting with 2 plus votes:** Alice votes for Solana and Ethereum, verifies vote counts increase correctly
- **Voting with minus vote:** Bob votes for Polygon and Avalanche with a minus vote for Solana, verifies Solana count decreases
- **Poll closure:** Creator closes the poll, verifies is_active becomes false

**Unhappy Path Tests:**

- **Insufficient candidates:** Attempts to create a poll with only 2 candidates, expects InvalidCandidateCount error
- **Excessive votes:** Tries to cast 3 votes when max is 2, expects TooManyPlusVotes error
- **Duplicate candidate selection:** Votes for the same candidate twice, expects DuplicateVote error
- **Minus vote when disabled:** Attempts a minus vote on a poll that doesn't allow it, expects MinusVoteNotAllowed error
- **Voting on closed poll:** Tries to vote after poll is closed, expects PollClosed error
- **Unauthorized closure:** Non-creator tries to close a poll, expects Unauthorized error

### Running Tests

```bash
# Navigate to the Anchor project directory
cd voting_dapp

# Run all tests (starts local validator, deploys program, runs tests)
anchor test

# Run tests without rebuilding (faster if no code changes)
anchor test --skip-build

```

### Additional Notes for Evaluators

This was my first experience building a complex multi-account Solana dApp. The main challenges were managing the Vec<u8> encoding issues with Anchor 0.31.1 (solved by using fixed parameters instead of vectors) and understanding PDA derivation with multiple seeds for the poll addressing scheme. The D21 voting method required careful validation logic to prevent invalid vote combinations like voting for the same candidate twice or casting a minus vote on someone you supported.

I learned extensively about account ownership verification, handling signed integers for vote counts (to support negative votes), and structuring PDAs for scalability. The frontend integration with wallet adapters was initially confusing, but connecting the React UI to on-chain program calls through Anchor's TypeScript client became clearer with practice. Testing both happy and unhappy paths helped me understand Solana's error handling and transaction validation mechanisms.
