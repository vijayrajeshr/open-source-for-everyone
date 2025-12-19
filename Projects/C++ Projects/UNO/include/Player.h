#ifndef PLAYER_H
#define PLAYER_H

#include "Hand.h"
#include "Card.h"
#include <string>

class Player
{
protected:
    Hand hand;
    std::string name;

public:
    Player(const std::string &playerName);
    virtual ~Player() = default;

    void addCard(const Card &card);
    int getHandSize() const;
    bool hasWon() const;
    const std::string &getName() const;
    void displayHand() const;
    Card playCard(int index);
    bool canPlay(const Card &topCard) const;
    bool hasOnlyActionCards() const;

    // Pure virtual methods that derived classes must implement
    virtual int chooseCard(const Card &topCard) = 0;
    virtual bool wantsToPull() = 0;
    virtual Color chooseColor() = 0;

protected:
    const Hand &getHand() const { return hand; }
};

class HumanPlayer : public Player
{
public:
    HumanPlayer();

    int chooseCard(const Card &topCard) override;
    bool wantsToPull() override;
    Color chooseColor() override;
};

class ComputerPlayer : public Player
{
public:
    ComputerPlayer();

    int chooseCard(const Card &topCard) override;
    bool wantsToPull() override;
    Color chooseColor() override;
};

#endif // PLAYER_H