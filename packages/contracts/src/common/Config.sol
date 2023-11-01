// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

int256 constant VRGDA_PRICE_DECAY = 0.5e18;
uint16 constant VRGDA_UNITS_PER_INTERVAL = 3;
int256 constant VRGDA_TARGET_PRICE = 0.00016e18;
uint16 constant BLOCKS_PER_INTERVAL = 43200; // 1 day if 2 second block time
uint16 constant INITIAL_CANVAS_DIM = 35; // Must be odd
int256 constant WAD_CANVAS_GROWTH_ROOT = 1.44e18;
