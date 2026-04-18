// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {DailyCheckIn} from "../DailyCheckIn.sol";

contract DailyCheckInTest is Test {
    DailyCheckIn public c;

    address alice = address(0xA11CE);

    function setUp() public {
        c = new DailyCheckIn();
    }

    function test_checkIn_no_value() public {
        vm.prank(alice);
        c.checkIn();
        assertEq(c.streak(alice), 1);
    }

    function test_reverts_on_tip() public {
        vm.deal(alice, 1 ether);
        vm.expectRevert(DailyCheckIn.NoValueAllowed.selector);
        vm.prank(alice);
        c.checkIn{value: 1 wei}();
    }

    function test_reverts_second_check_same_day() public {
        vm.prank(alice);
        c.checkIn();
        vm.prank(alice);
        vm.expectRevert(DailyCheckIn.AlreadyCheckedInToday.selector);
        c.checkIn();
    }

    function test_streak_consecutive_days() public {
        vm.prank(alice);
        c.checkIn();

        vm.warp(block.timestamp + 1 days);
        vm.prank(alice);
        c.checkIn();

        assertEq(c.streak(alice), 2);
    }
}
