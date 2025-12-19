#include "Hand.h"
#include <iostream>
#include <stdexcept>

void Hand::addCard(const Card &card)
{
    cards.push_back(card);
}

Card Hand::removeCard(int index)
{
    if (index < 0 || index >= static_cast<int>(cards.size()))
    {
        throw std::out_of_range("Invalid card index");
    }
    Card card = cards[index];
    cards.erase(cards.begin() + index);
    return card;
}

const Card &Hand::getCard(int index) const
{
    if (index < 0 || index >= static_cast<int>(cards.size()))
    {
        throw std::out_of_range("Invalid card index");
    }
    return cards[index];
}

void Hand::displayCards() const
{
    for (size_t i = 0; i < cards.size(); ++i)
    {
        std::cout << " " << (i + 1) << ". " << cards[i].toString() << std::endl;
    }
}

int Hand::size() const
{
    return static_cast<int>(cards.size());
}

bool Hand::isEmpty() const
{
    return cards.empty();
}

bool Hand::hasOnlyActionCards() const
{
    for (const Card &card : cards)
    {
        if (card.getCardType() == CardType::NUMBER)
        {
            return false;
        }
    }
    return true;
}

int Hand::findValidCard(const Card &topCard) const
{
    for (size_t i = 0; i < cards.size(); ++i)
    {
        if (cards[i].canPlayOn(topCard))
        {
            return static_cast<int>(i);
        }
    }
    return -1; // No valid card found
}

Color Hand::getFirstCardColor() const
{
    if (!cards.empty() && cards[0].getColor() != Color::NONE)
    {
        return cards[0].getColor();
    }
    return Color::RED; // Default fallback
}