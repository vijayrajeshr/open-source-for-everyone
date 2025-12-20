#ifndef DECK_H
#define DECK_H

#include "Card.h"
#include <vector>
#include <random>

class Deck
{
private:
    std::vector<Card> cards;
    std::mt19937 rng;

public:
    Deck();

    void initializeDeck();
    void shuffle();
    Card deal();
    bool isEmpty() const;
    size_t size() const;
};

#endif // DECK_H