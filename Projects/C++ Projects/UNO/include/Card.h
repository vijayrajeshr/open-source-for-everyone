#ifndef CARD_H
#define CARD_H

#include <string>
#include <map>

enum class Color
{
    RED,
    GREEN,
    BLUE,
    YELLOW,
    NONE
};

enum class Rank
{
    ZERO,
    ONE,
    TWO,
    THREE,
    FOUR,
    FIVE,
    SIX,
    SEVEN,
    EIGHT,
    NINE,
    SKIP,
    REVERSE,
    DRAW2,
    DRAW4,
    WILD
};

enum class CardType
{
    NUMBER,
    ACTION,
    ACTION_NOCOLOR
};

class Card
{
private:
    Color color;
    Rank rank;
    CardType cardType;

public:
    static const std::map<Rank, CardType> rankToType;
    static const std::map<Color, std::string> colorToString;
    static const std::map<Rank, std::string> rankToString;

public:
    Card(Color c, Rank r);

    // Getters
    Color getColor() const { return color; }
    Rank getRank() const { return rank; }
    CardType getCardType() const { return cardType; }

    // Setter for color (used with Wild/Draw4 cards)
    void setColor(Color c) { color = c; }

    std::string toString() const;
    bool canPlayOn(const Card &topCard) const;
};

#endif // CARD_H