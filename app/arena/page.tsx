"use client";

import { Navbar } from "@/components/Navbar";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
  Plus,
  Users,
  Trophy,
  Clock,
} from "lucide-react";

interface Game {
  id: number;
  players: [string, string];
  rolls: [number, number];
  betAmount: string;
  state: number;
  winner: string;
  createdAt: number;
  startBlock: number;
}

const DiceIcon = ({ value }: { value: number }) => {
  const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
  const Icon = icons[value - 1] || Dice1;
  return <Icon className="w-8 h-8" />;
};

const Arena = () => {
  const [account, setAccount] = useState<string>("");
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [betAmount, setBetAmount] = useState<string>("0.01");
  const [minBet, setMinBet] = useState<string>("0");
  const [loading, setLoading] = useState<boolean>(false);
  const [rollingDice, setRollingDice] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  useEffect(() => {
    if (account && typeof window !== "undefined" && window.ethereum) {
      initializeContract();
    }
  }, [account]);

  const checkWalletConnection = async () => {
    try {
      if (!window.ethereum) {
        console.log("MetaMask not found");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        const savedAccount = sessionStorage.getItem("walletAccount");
        if (savedAccount && accounts.includes(savedAccount)) {
          setAccount(savedAccount);
        }
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    } catch (error) {
      console.error("Error checking wallet connection:", error);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setAccount("");
      sessionStorage.removeItem("walletAccount");
      setContract(null);
    } else {
      setAccount(accounts[0]);
      sessionStorage.setItem("walletAccount", accounts[0]);
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const initializeContract = async () => {
    try {
      if (!window.ethereum) {
        console.error("No Ethereum provider found. Please install MetaMask.");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );
      setContract(contractInstance);

      const minBetAmount = await contractInstance.minBetAmount();
      setMinBet(ethers.formatEther(minBetAmount));

      loadGames(contractInstance);
    } catch (error) {
      console.error("Failed to initialize contract:", error);
    }
  };

  const disconnectWallet = () => {
    setAccount("");
    setContract(null);
    sessionStorage.removeItem("walletAccount");
  };

  const loadGames = async (contractInstance?: ethers.Contract) => {
    try {
      const contractToUse = contractInstance || contract;
      if (!contractToUse) return;

      const activeGameIds = await contractToUse.getActiveGames();
      const gameDetails = await Promise.all(
        activeGameIds.map(async (id: bigint) => {
          const details = await contractToUse.getGameDetails(id);
          return {
            id: Number(id),
            players: details[0],
            rolls: details[1],
            betAmount: ethers.formatEther(details[2]),
            state: details[3],
            winner: details[4],
            createdAt: Number(details[5]),
            startBlock: Number(details[6]),
          };
        })
      );

      setGames(gameDetails);
    } catch (error) {
      console.error("Failed to load games:", error);
    }
  };

  const createGame = async () => {
    if (!contract || !account) return;

    try {
      setLoading(true);
      const betInWei = ethers.parseEther(betAmount);
      const tx = await contract.createGame({ value: betInWei });
      await tx.wait();

      console.log("Game created successfully");
      loadGames();
    } catch (error: any) {
      console.error("Failed to create game:", error);
      alert("Failed to create game. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const joinGame = async (gameId: number, betAmount: string) => {
    if (!contract || !account) return;

    try {
      setLoading(true);
      const betInWei = ethers.parseEther(betAmount);
      const tx = await contract.joinGame(gameId, { value: betInWei });
      await tx.wait();

      console.log("Joined game:", gameId);
      loadGames();
    } catch (error: any) {
      console.error("Failed to join game:", error);
      alert("Failed to join game. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const rollDice = async (gameId: number) => {
    if (!contract || !account) return;

    try {
      setRollingDice(gameId);
      const tx = await contract.rollDice(gameId);
      await tx.wait();

      console.log("Dice rolled for game:", gameId);

      setTimeout(() => {
        loadGames();
        setRollingDice(null);
      }, 2000);
    } catch (error: any) {
      console.error("Failed to roll dice:", error);
      alert("Failed to roll dice. Please try again.");
      setRollingDice(null);
    }
  };

  const getGameStateBadge = (state: number) => {
    switch (state) {
      case 0:
        return (
          <Badge
            variant="outline"
            className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50"
          >
            Waiting
          </Badge>
        );
      case 1:
        return (
          <Badge
            variant="outline"
            className="bg-green-500/20 text-green-300 border-green-500/50"
          >
            Ready
          </Badge>
        );
      case 2:
        return (
          <Badge
            variant="outline"
            className="bg-blue-500/20 text-blue-300 border-blue-500/50"
          >
            Completed
          </Badge>
        );
      case 3:
        return (
          <Badge
            variant="outline"
            className="bg-red-500/20 text-red-300 border-red-500/50"
          >
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  useEffect(() => {
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 lg:pt-20">
      <Navbar />
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="absolute inset-0 bg-zinc-950" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(16,185,129,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(59,130,246,0.1),transparent_50%)]" />
          {account ? (
            <div>
              <div className="mb-6 flex justify-between items-center">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-green-500/30">
                  <p className="text-green-400 text-sm">Connected Wallet</p>
                  <p className="text-white font-mono">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </p>
                </div>
                <Button
                  onClick={disconnectWallet}
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                >
                  Disconnect
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <Card className="bg-slate-800/50 border-green-500/30 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-green-400 flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Create New Game
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        Start a new dice duel and wait for an opponent
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm text-slate-300 mb-2 block">
                          Bet Amount (tCORE)
                        </label>
                        <Input
                          type="number"
                          step="0.001"
                          min={minBet}
                          value={betAmount}
                          onChange={(e: any) => setBetAmount(e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="0.01"
                        />
                        <p className="text-xs text-slate-400 mt-1">
                          Minimum bet: {minBet} tCORE
                        </p>
                      </div>

                      <Button
                        onClick={createGame}
                        disabled={
                          loading ||
                          !betAmount ||
                          Number.parseFloat(betAmount) <
                            Number.parseFloat(minBet)
                        }
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        {loading ? "Creating..." : "Create Game"}
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-2">
                  <Card className="bg-slate-800/50 border-green-500/30 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-green-400 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Active Games
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        Join a game or roll the dice if you're ready
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {games.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                          <Dice1 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No active games. Create one to get started!</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {games.map((game) => (
                            <div
                              key={game.id}
                              className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-white font-semibold">
                                      Game #{game.id}
                                    </span>
                                    {getGameStateBadge(game.state)}
                                  </div>
                                  <p className="text-green-400 font-mono">
                                    Bet: {game.betAmount} tCORE
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {game.state === 2 && (
                                    <Trophy className="w-5 h-5 text-yellow-400" />
                                  )}
                                  {game.state === 0 && (
                                    <Clock className="w-5 h-5 text-yellow-400" />
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-slate-600/50 rounded p-3">
                                  <p className="text-xs text-slate-400 mb-1">
                                    Player 1
                                  </p>
                                  <p className="text-white font-mono text-sm">
                                    {game.players[0]
                                      ? `${game.players[0].slice(0, 6)}...${game.players[0].slice(-4)}`
                                      : "Waiting..."}
                                  </p>
                                  {game.rolls[0] > 0 && (
                                    <div className="flex items-center gap-2 mt-2">
                                      <DiceIcon value={game.rolls[0]} />
                                      <span className="text-green-400 font-bold">
                                        {game.rolls[0]}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <div className="bg-slate-600/50 rounded p-3">
                                  <p className="text-xs text-slate-400 mb-1">
                                    Player 2
                                  </p>
                                  <p className="text-white font-mono text-sm">
                                    {game.players[1]
                                      ? `${game.players[1].slice(0, 6)}...${game.players[1].slice(-4)}`
                                      : "Waiting..."}
                                  </p>
                                  {game.rolls[1] > 0 && (
                                    <div className="flex items-center gap-2 mt-2">
                                      <DiceIcon value={game.rolls[1]} />
                                      <span className="text-green-400 font-bold">
                                        {game.rolls[1]}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {game.state === 2 &&
                                game.winner !==
                                  "0x0000000000000000000000000000000000000000" && (
                                  <div className="bg-yellow-500/20 border border-yellow-500/50 rounded p-3 mb-4">
                                    <div className="flex items-center gap-2">
                                      <Trophy className="w-5 h-5 text-yellow-400" />
                                      <span className="text-yellow-300 font-semibold">
                                        Winner: {game.winner.slice(0, 6)}...
                                        {game.winner.slice(-4)}
                                      </span>
                                    </div>
                                  </div>
                                )}

                              <div className="flex gap-2">
                                {game.state === 0 &&
                                  game.players[0] !== account && (
                                    <Button
                                      onClick={() =>
                                        joinGame(game.id, game.betAmount)
                                      }
                                      disabled={loading}
                                      className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                      Join Game
                                    </Button>
                                  )}
                                {game.state === 1 &&
                                  (game.players[0] === account ||
                                    game.players[1] === account) && (
                                    <Button
                                      onClick={() => rollDice(game.id)}
                                      disabled={
                                        loading || rollingDice === game.id
                                      }
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                      {rollingDice === game.id ? (
                                        <div className="flex items-center gap-2">
                                          <div className="animate-spin">🎲</div>
                                          Rolling...
                                        </div>
                                      ) : (
                                        <>
                                          <Dice1 className="w-4 h-4 mr-2" />
                                          Roll Dice
                                        </>
                                      )}
                                    </Button>
                                  )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Arena;

const CONTRACT_ADDRESS = "0x786CDa61792AEb23Df71b08535d0Eeb366Bb29c7";
const CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_gameId",
        type: "uint256",
      },
    ],
    name: "cancelExpiredGame",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_gameId",
        type: "uint256",
      },
    ],
    name: "cancelGame",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "createGame",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "emergencyWithdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_treasury",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "roll1",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "roll2",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "address",
        name: "winner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "payout",
        type: "uint256",
      },
    ],
    name: "DiceRolled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "initiator",
        type: "address",
      },
    ],
    name: "GameCanceled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "player1",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "bet",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "GameCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "oldFee",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newFee",
        type: "uint256",
      },
    ],
    name: "HouseFeeUpdated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_gameId",
        type: "uint256",
      },
    ],
    name: "joinGame",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "oldAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newAmount",
        type: "uint256",
      },
    ],
    name: "MinBetUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Paused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "winner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Payout",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "player2",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "PlayerJoined",
    type: "event",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_gameId",
        type: "uint256",
      },
    ],
    name: "rollDice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_percent",
        type: "uint256",
      },
    ],
    name: "setHouseFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "setMinBetAmount",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_treasury",
        type: "address",
      },
    ],
    name: "setTreasury",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "oldTreasury",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "newTreasury",
        type: "address",
      },
    ],
    name: "TreasuryUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Unpaused",
    type: "event",
  },
  {
    stateMutability: "payable",
    type: "fallback",
  },
  {
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
  {
    inputs: [],
    name: "gameId",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "games",
    outputs: [
      {
        internalType: "uint256",
        name: "betAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "startBlock",
        type: "uint256",
      },
      {
        internalType: "address payable",
        name: "player1",
        type: "address",
      },
      {
        internalType: "address payable",
        name: "player2",
        type: "address",
      },
      {
        internalType: "uint8",
        name: "player1Roll",
        type: "uint8",
      },
      {
        internalType: "uint8",
        name: "player2Roll",
        type: "uint8",
      },
      {
        internalType: "enum DiceDuel.GameState",
        name: "state",
        type: "uint8",
      },
      {
        internalType: "address",
        name: "winner",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "createdAt",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getActiveGames",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getContractBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_gameId",
        type: "uint256",
      },
    ],
    name: "getGameDetails",
    outputs: [
      {
        internalType: "address[2]",
        name: "players",
        type: "address[2]",
      },
      {
        internalType: "uint8[2]",
        name: "rolls",
        type: "uint8[2]",
      },
      {
        internalType: "uint256",
        name: "betAmount",
        type: "uint256",
      },
      {
        internalType: "enum DiceDuel.GameState",
        name: "state",
        type: "uint8",
      },
      {
        internalType: "address",
        name: "winner",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "createdAt",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "startBlock",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "player",
        type: "address",
      },
    ],
    name: "getPlayerGames",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "houseFeePercent",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_gameId",
        type: "uint256",
      },
    ],
    name: "isGameExpired",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MAX_BLOCK_DELAY",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "minBetAmount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "playerGames",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "treasury",
    outputs: [
      {
        internalType: "address payable",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
