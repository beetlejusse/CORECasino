// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract DiceDuel is Ownable, ReentrancyGuard, Pausable {
    uint256 public gameId;
    uint256 public minBetAmount = 0.01 ether;
    uint256 public houseFeePercent = 3;
    uint256 public constant MAX_BLOCK_DELAY = 200;
    address payable public treasury;

    enum GameState {
        WAITING,
        READY,
        FINISHED,
        CANCELED
    }

    struct Game {
        uint256 betAmount;
        uint256 startBlock;
        address payable player1;
        address payable player2;
        uint8 player1Roll;
        uint8 player2Roll;
        GameState state;
        address winner;
        uint256 createdAt;
    }

    mapping(uint256 => Game) public games;
    mapping(address => uint256[]) public playerGames;

    event GameCreated(
        uint256 indexed gameId,
        address indexed player1,
        uint256 bet,
        uint256 timestamp
    );
    event PlayerJoined(
        uint256 indexed gameId,
        address indexed player2,
        uint256 timestamp
    );
    event DiceRolled(
        uint256 indexed gameId,
        uint8 roll1,
        uint8 roll2,
        address winner,
        uint256 payout
    );
    event Payout(address indexed winner, uint256 amount);
    event GameCanceled(uint256 indexed gameId, address initiator);
    event TreasuryUpdated(address oldTreasury, address newTreasury);
    event MinBetUpdated(uint256 oldAmount, uint256 newAmount);
    event HouseFeeUpdated(uint256 oldFee, uint256 newFee);

    constructor(address _treasury) Ownable(msg.sender) {
        require(_treasury != address(0), "Invalid treasury address");
        treasury = payable(_treasury);
    }

    modifier validGame(uint256 _gameId) {
        require(_gameId < gameId, "Invalid game ID");
        require(games[_gameId].player1 != address(0), "Game does not exist");
        _;
    }

    modifier onlyGameParticipant(uint256 _gameId) {
        Game storage game = games[_gameId];
        require(
            msg.sender == game.player1 || msg.sender == game.player2,
            "Not a game participant"
        );
        _;
    }

    // Admin functions
    function setMinBetAmount(uint256 _amount) external onlyOwner {
        require(_amount > 0, "Amount must be greater than 0");
        emit MinBetUpdated(minBetAmount, _amount);
        minBetAmount = _amount;
    }

    function setHouseFee(uint256 _percent) external onlyOwner {
        require(_percent <= 10, "Fee too high (max 10%)");
        emit HouseFeeUpdated(houseFeePercent, _percent);
        houseFeePercent = _percent;
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury address");
        emit TreasuryUpdated(treasury, _treasury);
        treasury = payable(_treasury);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        treasury.transfer(balance);
    }

    // Game functions
    function createGame() external payable whenNotPaused nonReentrant {
        require(msg.value >= minBetAmount, "Bet amount too low");

        Game storage game = games[gameId];
        game.player1 = payable(msg.sender);
        game.betAmount = msg.value;
        game.state = GameState.WAITING;
        game.startBlock = block.number;
        game.createdAt = block.timestamp;

        playerGames[msg.sender].push(gameId);

        emit GameCreated(gameId, msg.sender, msg.value, block.timestamp);
        gameId++;
    }

    function joinGame(
        uint256 _gameId
    ) external payable validGame(_gameId) whenNotPaused nonReentrant {
        Game storage game = games[_gameId];
        require(game.state == GameState.WAITING, "Game not joinable");
        require(msg.value == game.betAmount, "Bet amount mismatch");
        require(msg.sender != game.player1, "Cannot join own game");
        require(
            block.number <= game.startBlock + MAX_BLOCK_DELAY,
            "Game expired"
        );

        game.player2 = payable(msg.sender);
        game.state = GameState.READY;
        game.startBlock = block.number;

        playerGames[msg.sender].push(_gameId);

        emit PlayerJoined(_gameId, msg.sender, block.timestamp);
    }

    function rollDice(
        uint256 _gameId
    )
        external
        validGame(_gameId)
        onlyGameParticipant(_gameId)
        whenNotPaused
        nonReentrant
    {
        Game storage game = games[_gameId];
        require(game.state == GameState.READY, "Game not ready");
        require(
            block.number <= game.startBlock + MAX_BLOCK_DELAY,
            "Game expired"
        );

        game.player1Roll = _generateRoll(game.player1, game.startBlock, 1);
        game.player2Roll = _generateRoll(game.player2, game.startBlock, 2);
        game.state = GameState.FINISHED;

        uint256 payout = _determineWinner(_gameId);

        emit DiceRolled(
            _gameId,
            game.player1Roll,
            game.player2Roll,
            game.winner,
            payout
        );
    }

    function cancelGame(
        uint256 _gameId
    ) external validGame(_gameId) nonReentrant {
        Game storage game = games[_gameId];
        require(game.state == GameState.WAITING, "Game cannot be canceled");
        require(msg.sender == game.player1, "Only creator can cancel");

        game.state = GameState.CANCELED;
        game.player1.transfer(game.betAmount);

        emit GameCanceled(_gameId, msg.sender);
    }

    function cancelExpiredGame(
        uint256 _gameId
    ) external validGame(_gameId) nonReentrant {
        Game storage game = games[_gameId];
        require(
            game.state == GameState.WAITING || game.state == GameState.READY,
            "Game cannot be canceled"
        );
        require(
            block.number > game.startBlock + MAX_BLOCK_DELAY,
            "Game not expired yet"
        );

        game.state = GameState.CANCELED;

        if (game.state == GameState.WAITING) {
            game.player1.transfer(game.betAmount);
        } else {
            game.player1.transfer(game.betAmount);
            game.player2.transfer(game.betAmount);
        }

        emit GameCanceled(_gameId, msg.sender);
    }

    // Internal utility
    function _generateRoll(
        address player,
        uint256 startBlock,
        uint256 nonce
    ) private view returns (uint8) {
        bytes32 hash = keccak256(
            abi.encodePacked(
                player,
                blockhash(startBlock),
                blockhash(block.number - 1),
                block.prevrandao,
                block.timestamp,
                block.number,
                nonce,
                address(this)
            )
        );
        return uint8((uint256(hash) % 6) + 1);
    }

    function _determineWinner(uint256 _gameId) private returns (uint256) {
        Game storage game = games[_gameId];
        uint256 totalPot = game.betAmount * 2;
        uint256 fee = (totalPot * houseFeePercent) / 100;
        uint256 payout = totalPot - fee;

        if (game.player1Roll > game.player2Roll) {
            game.winner = game.player1;
            if (fee > 0) treasury.transfer(fee);
            game.player1.transfer(payout);
            emit Payout(game.player1, payout);
        } else if (game.player2Roll > game.player1Roll) {
            game.winner = game.player2;
            if (fee > 0) treasury.transfer(fee);
            game.player2.transfer(payout);
            emit Payout(game.player2, payout);
        } else {
            game.player1.transfer(game.betAmount);
            game.player2.transfer(game.betAmount);
            payout = 0;
        }

        return payout;
    }

    // View functions
    function getGameDetails(
        uint256 _gameId
    )
        external
        view
        validGame(_gameId)
        returns (
            address[2] memory players,
            uint8[2] memory rolls,
            uint256 betAmount,
            GameState state,
            address winner,
            uint256 createdAt,
            uint256 startBlock
        )
    {
        Game storage game = games[_gameId];
        return (
            [address(game.player1), address(game.player2)],
            [game.player1Roll, game.player2Roll],
            game.betAmount,
            game.state,
            game.winner,
            game.createdAt,
            game.startBlock
        );
    }

    function getPlayerGames(
        address player
    ) external view returns (uint256[] memory) {
        return playerGames[player];
    }

    function getActiveGames() external view returns (uint256[] memory) {
        uint256[] memory activeGames = new uint256[](gameId);
        uint256 count = 0;

        for (uint256 i = 0; i < gameId; i++) {
            if (
                games[i].state == GameState.WAITING ||
                games[i].state == GameState.READY
            ) {
                activeGames[count++] = i;
            }
        }

        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeGames[i];
        }

        return result;
    }

    function isGameExpired(
        uint256 _gameId
    ) external view validGame(_gameId) returns (bool) {
        return block.number > games[_gameId].startBlock + MAX_BLOCK_DELAY;
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // Fallback protection
    receive() external payable {
        revert("Direct payments not allowed");
    }

    fallback() external payable {
        revert("Function not found");
    }
}
