# UNO Card Game

A console-based implementation of the classic UNO card game written in C++.

## Features

- Full UNO gameplay with number cards, action cards (Skip, Reverse, Draw2), and wild cards (Wild, Draw4)
- Human vs Computer player
- Proper UNO rules implementation including:
  - Color and number matching
  - Action card effects
  - Wild card color selection
  - Last card action card restriction
  - Card drawing mechanics

## Project Structure

```
UNO/
├── include/
│   ├── Card.h
│   ├── Deck.h
│   ├── Hand.h
│   ├── Player.h
│   └── UnoGame.h
├── src/
│   ├── Card.cpp
│   ├── Deck.cpp
│   ├── Hand.cpp
│   ├── Player.cpp
│   ├── UnoGame.cpp
│   └── main.cpp
└── Makefile
└── README.md
```

## Classes Overview

### Card
- Represents individual UNO cards
- Handles card types, colors, ranks, and play validation
- Contains static maps for string representations

### Deck
- Manages the deck of cards
- Handles deck initialization, shuffling, and dealing
- Uses proper UNO deck composition (108 cards total)

### Hand
- Manages a player's collection of cards
- Provides card manipulation and validation methods
- Handles display and card finding logic

### Player (Abstract Base Class)
- Base class for all player types
- Defines common player functionality
- Pure virtual methods for player-specific behavior

### HumanPlayer
- Implements human player interaction
- Handles user input for card selection and color choices
- Provides interactive gameplay experience

### ComputerPlayer
- Implements AI player behavior
- Simple strategy for card selection and color choices
- Automated gameplay decisions

### UnoGame
- Main game engine that orchestrates gameplay
- Handles game flow, turn management, and rule enforcement
- Manages game state and win conditions

## Building and Running

### Prerequisites
- C++17 compatible compiler (g++, clang++)
- Make utility

### Build Commands

```bash
# Build the game
make

# Build and run
make run

# Build with debug symbols
make debug

# Clean build files
make clean

# Rebuild everything
make rebuild

# Show all available commands
make help
```

### Manual Compilation
If you prefer not to use make:

```bash
g++ -std=c++17 -Wall -Wextra -O2 *.cpp -o uno_game
```

## How to Play

1. Run the executable: `./uno_game`
2. The game will deal 7 cards to each player
3. A starting card is placed on the table
4. Players take turns either:
   - Playing a matching card (same color or number)
   - Playing an action card
   - Drawing a card from the deck
5. First player to empty their hand wins!

### Game Controls

- **Card Selection**: Enter the number (1-N) of the card you want to play
- **Hit or Pull**: Choose 'h' to play a card or 'p' to draw from deck
- **Color Selection**: For wild cards, choose 1-4 for Red/Green/Blue/Yellow

### Card Types

- **Number Cards (0-9)**: Match by color or number
- **Skip**: Skip opponent's turn (same as Reverse in 2-player)
- **Reverse**: Reverse turn order (same as Skip in 2-player)
- **Draw2**: Opponent draws 2 cards and loses turn
- **Wild**: Change color, can be played anytime
- **Draw4**: Opponent draws 4 cards, you choose new color

## Game Rules Implemented

- Standard UNO matching rules (color/number/wild)
- Action card effects properly implemented
- Last card cannot be an action card (draws additional card if so)
- Wild cards allow color selection
- Proper turn management and win detection
- Deck shuffling and random first player selection

## Extending the Game

The modular design makes it easy to extend:

- Add more player types by inheriting from `Player`
- Implement different AI strategies in new `ComputerPlayer` variants
- Add new card types by extending the `Rank` enum and updating logic
- Support more players by modifying the `UnoGame` class

## Technical Notes

- Uses C++17 features including enum classes and auto type deduction
- Exception handling for error conditions
- Clean separation of concerns with dedicated classes
- Cross-platform compatible (tested on Linux/macOS/Windows)
