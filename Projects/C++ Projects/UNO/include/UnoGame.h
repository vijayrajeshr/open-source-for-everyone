#ifndef UNOGAME_H
#define UNOGAME_H

#include "Deck.h"
#include "Player.h"
#include <random>

class UnoGame
{
private:
    Deck deck;
    HumanPlayer humanPlayer;
    ComputerPlayer computerPlayer;
    Card topCard;
    Player *currentPlayer;
    bool gameRunning;
    std::mt19937 rng;

public:
    UnoGame();

    void initializeGame();
    Player *chooseFirstPlayer();
    void switchPlayer();
    void handleLastCardRule(Player *player);
    void executeCardAction(const Card &playedCard, Player *player);
    void playTurn();
    void playHumanTurn();
    void playComputerTurn();
    void run();
};

#endif // UNOGAME_H