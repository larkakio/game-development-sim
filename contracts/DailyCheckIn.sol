// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Daily check-in on Base L2. Users pay only gas — no ETH to the contract.
/// @dev `lastCheckInDay` stores (calendarDay + 1); 0 means "never checked" (avoids day-0 ambiguity).
contract DailyCheckIn {
    uint256 public constant CHECK_IN_FEE = 0;

    /// @notice Packed storage: value is `dayIndex + 1`, or 0 if never checked.
    mapping(address => uint256) public lastCheckInDay;
    mapping(address => uint256) public streak;

    event CheckedIn(address indexed user, uint256 day, uint256 streak);

    error NoValueAllowed();
    error AlreadyCheckedInToday();

    function checkIn() external payable {
        if (msg.value != 0) revert NoValueAllowed();

        uint256 day = block.timestamp / 1 days;
        uint256 enc = lastCheckInDay[msg.sender];

        if (enc != 0 && enc - 1 == day) revert AlreadyCheckedInToday();

        uint256 s = 1;
        if (enc != 0 && enc - 1 == day - 1) {
            s = streak[msg.sender] + 1;
        }

        lastCheckInDay[msg.sender] = day + 1;
        streak[msg.sender] = s;

        emit CheckedIn(msg.sender, day, s);
    }
}
