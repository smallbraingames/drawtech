// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

struct Coord {
  int16 x;
  int16 y;
}

struct Unit {
  Coord coord;
  uint8 color;
}
