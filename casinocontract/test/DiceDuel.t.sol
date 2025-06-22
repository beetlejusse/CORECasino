// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/DiceDuel.sol";

contract DiceDuelTest is Test {
    DiceDuel diceDuel;
    address owner;
    address player1;
    address player2;

    function setUp() public {
        owner = address(this);
        player1 = address(0x1);
        player2 = address(0x2);
        diceDuel = new DiceDuel();
        vm.deal(player1, 10 ether);
        vm.deal(player2, 10 ether);
    }

    function test_CreateGame() public {
        vm.prank(player1);
        diceDuel.createGame{value: 0.01 ether}();
        (address p1,,uint256 bet,,,) = diceDuel.games(1);
        assertEq(p1, player1);
        assertEq(bet, 0.01 ether);
    }

    function test_CreateGame_RevertIfLowBet() public {
        vm.prank(player1);
        vm.expectRevert("Bet amount too low.");
        diceDuel.createGame{value: 0.009 ether}();
    }

    function test_JoinGame() public {
        vm.prank(player1);
        diceDuel.createGame{value: 0.01 ether}();
        vm.prank(player2);
        diceDuel.joinGame{value: 0.01 ether}(1);
        (,address p2,,uint8 state,,,) = diceDuel.games(1);
        assertEq(p2, player2);
        assertEq(state, 1); // ReadyToRoll
    }

    function test_JoinGame_RevertIfWrongBet() public {
        vm.prank(player1);
        diceDuel.createGame{value: 0.01 ether}();
        vm.prank(player2);
        vm.expectRevert("Bet Amount for both the oplayer should match");
        diceDuel.joinGame{value: 0.02 ether}(1);
    }

    function test_JoinGame_RevertIfSelfJoin() public {
        vm.prank(player1);
        diceDuel.createGame{value: 0.01 ether}();
        vm.prank(player1);
        vm.expectRevert("User can't join their own Game");
        diceDuel.joinGame{value: 0.01 ether}(1);
    }

    function test_DiceRoll_AndPayout() public {
        vm.prank(player1);
        diceDuel.createGame{value: 0.01 ether}();
        vm.prank(player2);
        diceDuel.joinGame{value: 0.01 ether}(1);

        // Capture balances before roll
        uint256 bal1Before = player1.balance;
        uint256 bal2Before = player2.balance;

        // Roll dice as player1
        vm.prank(player1);
        diceDuel.diceRoll(1);

        // Fetch updated game
        (, , , uint8 roll1, uint8 roll2, , address winner,) = diceDuel.games(1);

        // Winner gets 0.02 ether, loser gets 0, draw both get 0.01 ether
        if (roll1 == roll2) {
            assertEq(player1.balance, bal1Before + 0.01 ether);
            assertEq(player2.balance, bal2Before + 0.01 ether);
        } else if (winner == player1) {
            assertEq(player1.balance, bal1Before + 0.02 ether);
            assertEq(player2.balance, bal2Before);
        } else {
            assertEq(player2.balance, bal2Before + 0.02 ether);
            assertEq(player1.balance, bal1Before);
        }
    }

    function test_DiceRoll_RevertIfNotPlayer() public {
        vm.prank(player1);
        diceDuel.createGame{value: 0.01 ether}();
        vm.prank(player2);
        diceDuel.joinGame{value: 0.01 ether}(1);

        address notPlayer = address(0x3);
        vm.prank(notPlayer);
        vm.expectRevert("Unauthorized Player || Not a Player");
        diceDuel.diceRoll(1);
    }

    function test_GetGameSummary() public {
        vm.prank(player1);
        diceDuel.createGame{value: 0.01 ether}();
        vm.prank(player2);
        diceDuel.joinGame{value: 0.01 ether}(1);
        vm.prank(player1);
        diceDuel.diceRoll(1);

        vm.prank(player1);
        (, uint8 myRoll, uint8 theirRoll, uint256 betAmount, uint256 winnings, address winner) = diceDuel.getGameSummary(1);
        assertEq(betAmount, 0.01 ether);
        assertTrue(myRoll >= 1 && myRoll <= 6);
        assertTrue(theirRoll >= 1 && theirRoll <= 6);
        // winnings: 0, 0.01, or 0.02 ether depending on outcome
        assertTrue(winnings == 0 || winnings == 0.01 ether || winnings == 0.02 ether);
    }

    function test_SetMinBetAmount() public {
        diceDuel.setMinBetAmount(0.02 ether);
        assertEq(diceDuel.minBetAmount(), 0.02 ether);
    }

    function test_SetMinBetAmount_RevertIfNotOwner() public {
        vm.prank(player1);
        vm.expectRevert("Only owner can set min bet");
        diceDuel.setMinBetAmount(0.02 ether);
    }
}
