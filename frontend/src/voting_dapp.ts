/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/voting_dapp.json`.
 */
export type VotingDapp = {
  "address": "GmVVTa2jWgisJZAwbXHEVttEYxYcHDcLHBBxnD1mUmTq",
  "metadata": {
    "name": "votingDapp",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "castVote",
      "discriminator": [
        20,
        212,
        15,
        189,
        69,
        180,
        69,
        151
      ],
      "accounts": [
        {
          "name": "poll",
          "writable": true
        },
        {
          "name": "voteRecord",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  111,
                  116,
                  101,
                  95,
                  114,
                  101,
                  99,
                  111,
                  114,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "poll"
              },
              {
                "kind": "account",
                "path": "voter"
              }
            ]
          }
        },
        {
          "name": "voter",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "voteOption1",
          "type": "u8"
        },
        {
          "name": "voteOption2",
          "type": {
            "option": "u8"
          }
        },
        {
          "name": "minusVoteIndex",
          "type": {
            "option": "u8"
          }
        }
      ]
    },
    {
      "name": "closePoll",
      "discriminator": [
        139,
        213,
        162,
        65,
        172,
        150,
        123,
        67
      ],
      "accounts": [
        {
          "name": "poll",
          "writable": true
        },
        {
          "name": "creator",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "createPoll",
      "discriminator": [
        182,
        171,
        112,
        238,
        6,
        219,
        14,
        110
      ],
      "accounts": [
        {
          "name": "poll",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  108,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "account",
                "path": "poll_counter.poll_count",
                "account": "pollCounter"
              }
            ]
          }
        },
        {
          "name": "pollCounter",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  108,
                  108,
                  95,
                  99,
                  111,
                  117,
                  110,
                  116,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "question",
          "type": "string"
        },
        {
          "name": "candidates",
          "type": {
            "vec": "string"
          }
        },
        {
          "name": "maxPlusVotes",
          "type": "u8"
        },
        {
          "name": "allowMinusVote",
          "type": "bool"
        }
      ]
    },
    {
      "name": "initializePollCounter",
      "discriminator": [
        137,
        220,
        157,
        142,
        86,
        145,
        205,
        138
      ],
      "accounts": [
        {
          "name": "pollCounter",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  108,
                  108,
                  95,
                  99,
                  111,
                  117,
                  110,
                  116,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "poll",
      "discriminator": [
        110,
        234,
        167,
        188,
        231,
        136,
        153,
        111
      ]
    },
    {
      "name": "pollCounter",
      "discriminator": [
        196,
        1,
        77,
        116,
        60,
        205,
        237,
        189
      ]
    },
    {
      "name": "voteRecord",
      "discriminator": [
        112,
        9,
        123,
        165,
        234,
        9,
        157,
        167
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidCandidateCount",
      "msg": "Poll must have between 3 and 8 candidates"
    },
    {
      "code": 6001,
      "name": "invalidMaxVotes",
      "msg": "Max plus votes must be between 2 and 3"
    },
    {
      "code": 6002,
      "name": "questionTooLong",
      "msg": "Question is too long (max 200 characters)"
    },
    {
      "code": 6003,
      "name": "candidateNameTooLong",
      "msg": "Candidate name is too long (max 50 characters)"
    },
    {
      "code": 6004,
      "name": "pollClosed",
      "msg": "Poll is closed"
    },
    {
      "code": 6005,
      "name": "tooManyPlusVotes",
      "msg": "Too many plus votes"
    },
    {
      "code": 6006,
      "name": "mustCastAtLeastOnePlusVote",
      "msg": "Must cast at least one plus vote"
    },
    {
      "code": 6007,
      "name": "duplicateVote",
      "msg": "Cannot vote for the same candidate twice"
    },
    {
      "code": 6008,
      "name": "invalidCandidateIndex",
      "msg": "Invalid candidate index"
    },
    {
      "code": 6009,
      "name": "minusVoteNotAllowed",
      "msg": "Minus vote is not allowed for this poll"
    },
    {
      "code": 6010,
      "name": "minusVoteRequiresTwoPlusVotes",
      "msg": "Minus vote requires at least two plus votes"
    },
    {
      "code": 6011,
      "name": "cannotPlusAndMinusSameCandidate",
      "msg": "Cannot cast plus and minus vote for same candidate"
    },
    {
      "code": 6012,
      "name": "pollAlreadyClosed",
      "msg": "Poll is already closed"
    },
    {
      "code": 6013,
      "name": "unauthorized",
      "msg": "Unauthorized: Only poll creator can close poll"
    }
  ],
  "types": [
    {
      "name": "poll",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "pollId",
            "type": "u64"
          },
          {
            "name": "question",
            "type": "string"
          },
          {
            "name": "candidates",
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "voteCounts",
            "type": {
              "vec": "i64"
            }
          },
          {
            "name": "totalVoters",
            "type": "u64"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "maxPlusVotes",
            "type": "u8"
          },
          {
            "name": "allowMinusVote",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "pollCounter",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "pollCount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "voteRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "voter",
            "type": "pubkey"
          },
          {
            "name": "poll",
            "type": "pubkey"
          },
          {
            "name": "voteOption1",
            "type": "u8"
          },
          {
            "name": "voteOption2",
            "type": {
              "option": "u8"
            }
          },
          {
            "name": "minusVote",
            "type": {
              "option": "u8"
            }
          },
          {
            "name": "votedAt",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
