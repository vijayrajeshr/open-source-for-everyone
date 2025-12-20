#ifndef HAND_H
#define HAND_H

#include "Card.h"
#include <vector>

class Hand
{
private:
    std::vector<Card> cards;

public:
    void addCard(const Card &card);
    Card removeCard(int index);
    const Card &getCard(int index) const;
    void displayCards() const;
    int size() const;
    bool isEmpty() const;
    bool hasOnlyActionCards() const;
    int findValidCard(const Card &topCard) const;
    Color getFirstCardColor() const;
};

#endif // HAND_H