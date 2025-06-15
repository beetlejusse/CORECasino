// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DiceDuel {
    address public owner;
    uint256 public gameId;
    uint256 public minBetAmount = 0.01 ether;

    enum GameState {
        waitForPlayer,
        ReadyToRoll,
        Finished
    }

    struct Casino1 {
        address payable player1;
        address payable player2;
        uint256 betAmount;
        uint8 player1Roll;
        uint8 player2Roll;
        GameState state;
        address winner;
        uint256 startBlock;
    }

    mapping(uint256 => Casino1) public games;

    event GameCreated(
        uint256 indexed gameId,
        address indexed player1,
        uint256 bet
    );
    event PlayerJoined(uint256 indexed gameId, address indexed player2);
    
    event DiceRolled(
        uint256 indexed gameId,
        uint8 roll1,
        uint8 roll2,
        address winner
    );
    event Payout(address indexed winner, uint256 amount);

    constructor() {
        owner = msg.sender;
        gameId = 1;
    }

    function setMinBetAmount(uint256 _amount) external {
        require(msg.sender == owner, "Only owner can set min bet");
        minBetAmount = _amount;
    }

    function createGame() external payable {
        require(msg.value >= minBetAmount, "Bet amount too low.");
        Casino1 storage game = games[gameId];
        game.player1 = payable(msg.sender);
        game.betAmount = msg.value;
        game.state = GameState.waitForPlayer;
        game.startBlock = block.number;
        emit GameCreated(gameId, msg.sender, msg.value);
        gameId++;
    }

    function joinGame(uint256 _gameId) external payable {
        Casino1 storage game = games[_gameId];
        require(
            game.state == GameState.waitForPlayer,
            "Game not joinable || Game not started yet"
        );
        require(
            msg.value == game.betAmount,
            "Bet Amount for both the oplayer should match"
        );
        require(msg.sender != game.player1, "User can't join their own Game");
        //second player joins the existuing game and update state and emits event
        game.player2 = payable(msg.sender);
        game.state = GameState.ReadyToRoll;
        game.startBlock = block.number;

        emit PlayerJoined(_gameId, msg.sender);
    }

    function diceRoll(uint256 _gameId) external {
        //checking that the game is ready and the caller is player
        Casino1 storage game = games[_gameId];
        require(game.state == GameState.ReadyToRoll, "Game not ready Yet!!");
        require(
            msg.sender == game.player1 || msg.sender == game.player2,
            "Unauthorized Player || Not a Player"
        );
        // generating player1 random roll by combining their address, block hash and timestamp and mods it by 6 and adding 1
        // pseudo random rolls
        uint8 roll1 = uint8(
            (uint256(
                keccak256(
                    abi.encodePacked(
                        game.player1,
                        blockhash(game.startBlock),
                        block.timestamp
                    )
                )
            ) % 6) + 1
        );

        uint8 roll2 = uint8(
            (uint256(
                keccak256(
                    abi.encodePacked(
                        game.player1,
                        blockhash(game.startBlock),
                        block.timestamp
                    )
                )
            ) % 6) + 1
        );

        game.player1Roll = roll1;
        game.player2Roll = roll2;
        game.state = GameState.Finished;

        uint256 totalPot = game.betAmount * 2;

        if (roll1 > roll2) {
            game.winner = game.player1;
            game.player1.transfer(totalPot);
            emit Payout(game.player1, totalPot);
        } else if (roll2 > roll1) {
            game.winner = game.player2;
            game.player2.transfer(totalPot);
            emit Payout(game.player2, totalPot);
        } else {
            // game draws: refund both player
            game.player1.transfer(game.betAmount);
            game.player2.transfer(game.betAmount);
        }
    }

    function getGameSummary(uint256 _gameId)
        external
        view
        returns (
            string memory message,
            uint8 yourRoll,
            uint8 opponentRoll,
            uint256 betAmount,
            uint256 totalWinnings,
            address winner
        )
    {
        Casino1 storage game = games[_gameId];
        require(game.state == GameState.Finished, "Game not finished yet");
        require(
            msg.sender == game.player1 || msg.sender == game.player2,
            "Only players can view game summary"
        );

        bool isPlayer1 = msg.sender == game.player1;
        // bool isPlayer2 = msg.sender == game.player2;

        uint8 myRoll = isPlayer1 ? game.player1Roll : game.player2Roll;
        uint8 theirRoll = isPlayer1 ? game.player2Roll : game.player1Roll;

        if (game.player1Roll == game.player2Roll) {
            message = "It's a draw! Great match.";
            return (
                message,
                myRoll,
                theirRoll,
                game.betAmount,
                game.betAmount,
                address(0)
            );
        }

        if (msg.sender == game.winner) {
            message = "Congratulations! You won the Dice Duel!";
            return (
                message,
                myRoll,
                theirRoll,
                game.betAmount,
                game.betAmount * 2,
                game.winner
            );
        } else {
            message = "You lost the Dice Duel. Try again!";
            return (message, myRoll, theirRoll, game.betAmount, 0, game.winner);
        }
    }
} 