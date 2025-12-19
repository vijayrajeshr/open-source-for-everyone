#include "Deck.h"
#include <algorithm>
#include <chrono>
#include <stdexcept>

Deck::Deck() : rng(std::chrono::steady_clock::now().time_since_epoch().count())
{
    initializeDeck();
    shuffle();
}

void Deck::initializeDeck()
{
    const std::vector<Color> colors = {Color::RED, Color::GREEN, Color::BLUE, Color::YELLOW};
    const std::vector<Rank> ranks = {
        Rank::ZERO, Rank::ONE, Rank::TWO, Rank::THREE, Rank::FOUR,
        Rank::FIVE, Rank::SIX, Rank::SEVEN, Rank::EIGHT, Rank::NINE,
        Rank::SKIP, Rank::REVERSE, Rank::DRAW2, Rank::DRAW4, Rank::WILD};

    for (Color color : colors)
    {
        for (Rank rank : ranks)
        {
            if (Card::rankToType.at(rank) != CardType::ACTION_NOCOLOR)
            {
                cards.emplace_back(color, rank);
                cards.emplace_back(color, rank); // Two of each card
            }
            else
            {
                cards.emplace_back(color, rank); // One of each Wild/Draw4
            }
        }
    }
}

void Deck::shuffle()
{
    std::shuffle(cards.begin(), cards.end(), rng);
}

Card Deck::deal()
{
    if (cards.empty())
    {
        throw std::runtime_error("Cannot deal from empty deck");
    }
    Card card = cards.back();
    cards.pop_back();
    return card;
}

bool Deck::isEmpty() const
{
    return cards.empty();
}

size_t Deck::size() const
{
    return cards.size();
}