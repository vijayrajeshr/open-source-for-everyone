#include "Card.h"

// Static member definitions
const std::map<Rank, CardType> Card::rankToType = {
    {Rank::ZERO, CardType::NUMBER}, {Rank::ONE, CardType::NUMBER}, {Rank::TWO, CardType::NUMBER}, {Rank::THREE, CardType::NUMBER}, {Rank::FOUR, CardType::NUMBER}, {Rank::FIVE, CardType::NUMBER}, {Rank::SIX, CardType::NUMBER}, {Rank::SEVEN, CardType::NUMBER}, {Rank::EIGHT, CardType::NUMBER}, {Rank::NINE, CardType::NUMBER}, {Rank::SKIP, CardType::ACTION}, {Rank::REVERSE, CardType::ACTION}, {Rank::DRAW2, CardType::ACTION}, {Rank::DRAW4, CardType::ACTION_NOCOLOR}, {Rank::WILD, CardType::ACTION_NOCOLOR}};

const std::map<Color, std::string> Card::colorToString = {
    {Color::RED, "RED"}, {Color::GREEN, "GREEN"}, {Color::BLUE, "BLUE"}, {Color::YELLOW, "YELLOW"}};

const std::map<Rank, std::string> Card::rankToString = {
    {Rank::ZERO, "0"}, {Rank::ONE, "1"}, {Rank::TWO, "2"}, {Rank::THREE, "3"}, {Rank::FOUR, "4"}, {Rank::FIVE, "5"}, {Rank::SIX, "6"}, {Rank::SEVEN, "7"}, {Rank::EIGHT, "8"}, {Rank::NINE, "9"}, {Rank::SKIP, "Skip"}, {Rank::REVERSE, "Reverse"}, {Rank::DRAW2, "Draw2"}, {Rank::DRAW4, "Draw4"}, {Rank::WILD, "Wild"}};

Card::Card(Color c, Rank r) : color(c), rank(r)
{
    cardType = rankToType.at(r);
    if (cardType == CardType::ACTION_NOCOLOR)
    {
        color = Color::NONE;
    }
}

std::string Card::toString() const
{
    if (color == Color::NONE)
    {
        return rankToString.at(rank);
    }
    return colorToString.at(color) + " " + rankToString.at(rank);
}

bool Card::canPlayOn(const Card &topCard) const
{
    return (color == topCard.color) ||
           (rank == topCard.rank) ||
           (cardType == CardType::ACTION_NOCOLOR);
}