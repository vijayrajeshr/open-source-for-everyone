#include "Player.h"
#include <iostream>

// Base Player class implementation
Player::Player(const std::string &playerName) : name(playerName) {}

void Player::addCard(const Card &card)
{
    hand.addCard(card);
}

int Player::getHandSize() const
{
    return hand.size();
}

bool Player::hasWon() const
{
    return hand.isEmpty();
}

const std::string &Player::getName() const
{
    return name;
}

void Player::displayHand() const
{
    hand.displayCards();
}

Card Player::playCard(int index)
{
    return hand.removeCard(index);
}

bool Player::canPlay(const Card &topCard) const
{
    return hand.findValidCard(topCard) != -1;
}

bool Player::hasOnlyActionCards() const
{
    return hand.hasOnlyActionCards();
}

// HumanPlayer implementation
HumanPlayer::HumanPlayer() : Player("Player") {}

int HumanPlayer::chooseCard(const Card &topCard)
{
    std::cout << "\nTop card is: " << topCard.toString() << std::endl;

    int choice;
    do
    {
        std::cout << "Enter index of card (1-" << getHandSize() << "): ";
        std::cin >> choice;
        choice--; // Convert to 0-based index

        if (choice < 0 || choice >= getHandSize())
        {
            std::cout << "Invalid index. Try again." << std::endl;
            continue;
        }

        if (!getHand().getCard(choice).canPlayOn(topCard))
        {
            std::cout << "This card cannot be used. Try again." << std::endl;
            continue;
        }

        break;
    } while (true);

    return choice;
}

bool HumanPlayer::wantsToPull()
{
    char choice;
    std::cout << "\nHit or Pull? (h/p): ";
    std::cin >> choice;
    return (choice == 'p' || choice == 'P');
}

Color HumanPlayer::chooseColor()
{
    std::cout << "Choose color (1=RED, 2=GREEN, 3=BLUE, 4=YELLOW): ";
    int colorChoice;
    std::cin >> colorChoice;

    switch (colorChoice)
    {
    case 1:
        return Color::RED;
    case 2:
        return Color::GREEN;
    case 3:
        return Color::BLUE;
    case 4:
        return Color::YELLOW;
    default:
        return Color::RED; // Default fallback
    }
}

// ComputerPlayer implementation
ComputerPlayer::ComputerPlayer() : Player("PC") {}

int ComputerPlayer::chooseCard(const Card &topCard)
{
    return getHand().findValidCard(topCard);
}

bool ComputerPlayer::wantsToPull()
{
    return false; // PC always tries to play if possible
}

Color ComputerPlayer::chooseColor()
{
    return getHand().getFirstCardColor();
}