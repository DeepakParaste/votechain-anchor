import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { VotingDapp } from "../target/types/voting_dapp";
import { expect } from "chai";

describe("voting_dapp", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.VotingDapp as Program<VotingDapp>;
  
  let creator = provider.wallet;
  let alice: anchor.web3.Keypair;
  let bob: anchor.web3.Keypair;
  let charlie: anchor.web3.Keypair;

  let pollCounterPda: anchor.web3.PublicKey;
  let pollPda: anchor.web3.PublicKey;

  const question = "Which blockchain is best for smart contracts?";
  const candidates = ["Solana", "Ethereum", "Polygon", "Avalanche"];
  const maxPlusVotes = 2;
  const allowMinusVote = true;

  before(async () => {
    alice = anchor.web3.Keypair.generate();
    bob = anchor.web3.Keypair.generate();
    charlie = anchor.web3.Keypair.generate();

    const airdropAmount = 2 * anchor.web3.LAMPORTS_PER_SOL;
    
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(alice.publicKey, airdropAmount)
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(bob.publicKey, airdropAmount)
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(charlie.publicKey, airdropAmount)
    );

    [pollCounterPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("poll_counter"), creator.publicKey.toBuffer()],
      program.programId
    );
  });

  describe("Happy Path: Complete Voting Flow", () => {
    it("Step 1: Initialize poll counter", async () => {
      await program.methods
        .initializePollCounter()
        .accounts({
          pollCounter: pollCounterPda,
          creator: creator.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const pollCounter = await program.account.pollCounter.fetch(pollCounterPda);
      expect(pollCounter.creator.toString()).to.equal(creator.publicKey.toString());
      expect(pollCounter.pollCount.toNumber()).to.equal(0);
      
      console.log("Success: Poll counter initialized");
    });

    it("Step 2: Create a new poll", async () => {
      [pollPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("poll"),
          creator.publicKey.toBuffer(),
          new anchor.BN(0).toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      await program.methods
        .createPoll(question, candidates, maxPlusVotes, allowMinusVote)
        .accounts({
          poll: pollPda,
          pollCounter: pollCounterPda,
          creator: creator.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const poll = await program.account.poll.fetch(pollPda);
      expect(poll.question).to.equal(question);
      expect(poll.candidates).to.deep.equal(candidates);
      expect(poll.isActive).to.be.true;

      console.log("Success: Created poll - " + question);
    });

    it("Step 3: Alice votes for Solana and Ethereum", async () => {
      const [voteRecordPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("vote_record"), pollPda.toBuffer(), alice.publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .castVote(0, 1, null)
        .accounts({
          poll: pollPda,
          voteRecord: voteRecordPda,
          voter: alice.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([alice])
        .rpc();

      const poll = await program.account.poll.fetch(pollPda);
      expect(poll.voteCounts[0].toNumber()).to.equal(1);
      expect(poll.voteCounts[1].toNumber()).to.equal(1);
      expect(poll.totalVoters.toNumber()).to.equal(1);

      console.log("Success: Alice voted for Solana and Ethereum");
    });

    it("Step 4: Bob votes for Polygon and Avalanche, with minus vote for Solana", async () => {
      const [voteRecordPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("vote_record"), pollPda.toBuffer(), bob.publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .castVote(2, 3, 0)
        .accounts({
          poll: pollPda,
          voteRecord: voteRecordPda,
          voter: bob.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([bob])
        .rpc();

      const poll = await program.account.poll.fetch(pollPda);
      expect(poll.voteCounts[0].toNumber()).to.equal(0);
      expect(poll.voteCounts[2].toNumber()).to.equal(1);
      expect(poll.voteCounts[3].toNumber()).to.equal(1);
      expect(poll.totalVoters.toNumber()).to.equal(2);

      console.log("Success: Bob voted for Polygon and Avalanche, minus vote for Solana");
    });

    it("Step 5: Creator closes the poll", async () => {
      await program.methods
        .closePoll()
        .accounts({
          poll: pollPda,
          creator: creator.publicKey,
        })
        .rpc();

      const poll = await program.account.poll.fetch(pollPda);
      expect(poll.isActive).to.be.false;

      console.log("Success: Poll has been closed");
    });
  });

  describe("Error Handling: Testing Security", () => {
    let testPollPda: anchor.web3.PublicKey;

    before(async () => {
      const pollCounter = await program.account.pollCounter.fetch(pollCounterPda);
      
      [testPollPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("poll"),
          creator.publicKey.toBuffer(),
          pollCounter.pollCount.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      await program.methods
        .createPoll("Test Security Poll", ["Red", "Blue", "Green"], 2, false)
        .accounts({
          poll: testPollPda,
          pollCounter: pollCounterPda,
          creator: creator.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
    });

    it("Rejects poll creation with insufficient candidates", async () => {
      const pollCounter = await program.account.pollCounter.fetch(pollCounterPda);
      
      const [invalidPollPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("poll"),
          creator.publicKey.toBuffer(),
          pollCounter.pollCount.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      try {
        await program.methods
          .createPoll("Bad Poll", ["Only", "Two"], 2, false)
          .accounts({
            poll: invalidPollPda,
            pollCounter: pollCounterPda,
            creator: creator.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();
        expect.fail("Should have been rejected");
      } catch (error) {
        expect(error.toString()).to.include("InvalidCandidateCount");
        console.log("Success: Rejected poll with too few candidates");
      }
    });

    it("Rejects excessive votes", async () => {
      const [voteRecordPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("vote_record"), testPollPda.toBuffer(), charlie.publicKey.toBuffer()],
        program.programId
      );

      try {
        await program.methods
          .castVote(0, 1, 2)
          .accounts({
            poll: testPollPda,
            voteRecord: voteRecordPda,
            voter: charlie.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([charlie])
          .rpc();
        expect.fail("Should have been rejected");
      } catch (error) {
        expect(error.toString()).to.include("MinusVoteNotAllowed");
        console.log("Success: Rejected minus vote when disabled");
      }
    });

    it("Rejects duplicate candidate selection", async () => {
      const [voteRecordPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("vote_record"), testPollPda.toBuffer(), charlie.publicKey.toBuffer()],
        program.programId
      );

      try {
        await program.methods
          .castVote(0, 0, null)
          .accounts({
            poll: testPollPda,
            voteRecord: voteRecordPda,
            voter: charlie.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([charlie])
          .rpc();
        expect.fail("Should have been rejected");
      } catch (error) {
        expect(error.toString()).to.include("DuplicateVote");
        console.log("Success: Rejected duplicate candidate votes");
      }
    });

    it("Prevents voting on closed polls", async () => {
      const [voteRecordPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("vote_record"), testPollPda.toBuffer(), charlie.publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .castVote(0, 1, null)
        .accounts({
          poll: testPollPda,
          voteRecord: voteRecordPda,
          voter: charlie.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([charlie])
        .rpc();

      await program.methods
        .closePoll()
        .accounts({
          poll: testPollPda,
          creator: creator.publicKey,
        })
        .rpc();

      const newVoter = anchor.web3.Keypair.generate();
      await provider.connection.confirmTransaction(
        await provider.connection.requestAirdrop(newVoter.publicKey, anchor.web3.LAMPORTS_PER_SOL)
      );

      const [newVoteRecordPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("vote_record"), testPollPda.toBuffer(), newVoter.publicKey.toBuffer()],
        program.programId
      );

      try {
        await program.methods
          .castVote(0, null, null)
          .accounts({
            poll: testPollPda,
            voteRecord: newVoteRecordPda,
            voter: newVoter.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([newVoter])
          .rpc();
        expect.fail("Should have been rejected");
      } catch (error) {
        expect(error.toString()).to.include("PollClosed");
        console.log("Success: Prevented voting on closed poll");
      }
    });

    it("Prevents unauthorized poll closure", async () => {
      const pollCounter = await program.account.pollCounter.fetch(pollCounterPda);
      
      const [anotherPollPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("poll"),
          creator.publicKey.toBuffer(),
          pollCounter.pollCount.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      await program.methods
        .createPoll("Final Poll", ["A", "B", "C"], 2, false)
        .accounts({
          poll: anotherPollPda,
          pollCounter: pollCounterPda,
          creator: creator.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      try {
        await program.methods
          .closePoll()
          .accounts({
            poll: anotherPollPda,
            creator: alice.publicKey,
          })
          .signers([alice])
          .rpc();
        expect.fail("Should have been rejected");
      } catch (error) {
        expect(error.toString()).to.include("Unauthorized");
        console.log("Success: Prevented unauthorized poll closure");
      }
    });
  });

  describe("Final Results", () => {
    it("Displays complete voting results", async () => {
      const poll = await program.account.poll.fetch(pollPda);
      
      console.log("\n============================================================");
      console.log("FINAL VOTING RESULTS");
      console.log("============================================================");
      console.log("Question: " + poll.question);
      console.log("Total Participants: " + poll.totalVoters);
      console.log("Poll Status: " + (poll.isActive ? "Active" : "Closed"));
      console.log("\nVote Tally:");
      
      poll.candidates.forEach((candidate, index) => {
        const votes = poll.voteCounts[index].toNumber();
        const bar = "=".repeat(Math.max(0, votes * 5));
        console.log("  " + candidate.padEnd(15) + " | " + votes.toString().padStart(3) + " votes " + bar);
      });
      console.log("============================================================\n");
    });
  });
});
