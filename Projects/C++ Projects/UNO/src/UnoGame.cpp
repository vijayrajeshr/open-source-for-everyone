#include "UnoGame.h"
#include <iostream>
#include <chrono>
#include <thread>
#include <random>

UnoGame::UnoGame() : topCard(Color::RED, Rank::ZERO),
                     rng(std::chrono::steady_clock::now().time_since_epoch().count())
{
    gameRunning = false;
}

void UnoGame::initializeGame()
{
    deck = Deck();

    // Deal 7 cards to each player
    for (int i = 0; i < 7; ++i)
    {
        humanPlayer.addCard(deck.deal());
        computerPlayer.addCard(deck.deal());
    }

    // Get starting card (must be a number card)
    do
    {
        topCard = deck.deal();
    } while (topCard.getCardType() != CardType::NUMBER);

    std::cout << "\nStarting Card is: " << topCard.toString() << std::endl;

    // Choose who goes first
    currentPlayer = chooseFirstPlayer();
    std::cout << currentPlayer->getName() << " will go first" << std::endl;

    gameRunning = true;
}

Player *UnoGame::chooseFirstPlayer()
{
    std::uniform_int_distribution<int> dist(0, 1);
    return (dist(rng) == 0) ? static_cast<Player *>(&humanPlayer) : static_cast<Player *>(&computerPlayer);
}

void UnoGame::switchPlayer()
{
    currentPlayer = (currentPlayer == &humanPlayer) ? static_cast<Player *>(&computerPlayer) : static_cast<Player *>(&humanPlayer);
}

void UnoGame::handleLastCardRule(Player *player)
{
    if (player->getHandSize() == 1 && player->hasOnlyActionCards())
    {
        std::cout << "Last card cannot be action card. Adding one card from deck." << std::endl;
        player->addCard(deck.deal());
    }
}

void UnoGame::executeCardAction(const Card &playedCard, Player *player)
{
    switch (playedCard.getRank())
    {
    case Rank::SKIP:
    case Rank::REVERSE:
        // In 2-player game, Skip and Reverse have same effect
        std::cout << "Skip/Reverse played! " << player->getName() << " plays again!" << std::endl;
        break;

    case Rank::DRAW2:
    {
        Player *opponent = (player == &humanPlayer) ? static_cast<Player *>(&computerPlayer) : static_cast<Player *>(&humanPlayer);
        opponent->addCard(deck.deal());
        opponent->addCard(deck.deal());
        std::cout << opponent->getName() << " draws 2 cards!" << std::endl;
        break;
    }

    case Rank::DRAW4:
    {
        Player *opponent = (player == &humanPlayer) ? static_cast<Player *>(&computerPlayer) : static_cast<Player *>(&humanPlayer);
        for (int i = 0; i < 4; ++i)
        {
            opponent->addCard(deck.deal());
        }
        std::cout << opponent->getName() << " draws 4 cards!" << std::endl;

        Color newColor = player->chooseColor();
        topCard.setColor(newColor);
        std::cout << "Color changes to " << Card::colorToString.at(newColor) << std::endl;
        break;
    }

    case Rank::WILD:
    {
        Color newColor = player->chooseColor();
        topCard.setColor(newColor);
        std::cout << "Color changes to " << Card::colorToString.at(newColor) << std::endl;
        if (player == &computerPlayer)
        {
            switchPlayer(); // Wild card switches turn normally
        }
        break;
    }

    default:
        switchPlayer(); // Number cards switch turn
        break;
    }
}

void UnoGame::playTurn()
{
    handleLastCardRule(currentPlayer);

    if (currentPlayer == &humanPlayer)
    {
        playHumanTurn();
    }
    else
    {
        playComputerTurn();
    }
}

void UnoGame::playHumanTurn()
{
    std::cout << "Your cards:\n";
    humanPlayer.displayHand();
    if (humanPlayer.wantsToPull())
    {
        Card drawnCard = deck.deal();
        std::cout << "You got:" << drawnCard.toString() << std::endl;
        std::this_thread::sleep_for(std::chrono::milliseconds(1000));

        if (drawnCard.canPlayOn(topCard))
        {
            std::cout << "You can play this card!" << std::endl;
            topCard = drawnCard;
            executeCardAction(topCard, &humanPlayer);
        }
        else
        {
            std::cout << "Cannot use this card" << std::endl;
            humanPlayer.addCard(drawnCard);
            switchPlayer();
        }
    }
    else
    {
        int cardIndex = humanPlayer.chooseCard(topCard);
        Card playedCard = humanPlayer.playCard(cardIndex);
        std::cout << "You played: " << playedCard.toString() << std::endl;
        topCard = playedCard;
        executeCardAction(topCard, &humanPlayer);
    }

    if (humanPlayer.hasWon())
    {
        std::cout << "\nPLAYER WON!!" << std::endl;
        gameRunning = false;
    }
}

void UnoGame::playComputerTurn()
{
    std::this_thread::sleep_for(std::chrono::milliseconds(1000));

    int validCardIndex = computerPlayer.chooseCard(topCard);

    if (validCardIndex != -1)
    {
        Card playedCard = computerPlayer.playCard(validCardIndex);
        std::cout << "\nPC throws: " << playedCard.toString() << std::endl;
        std::this_thread::sleep_for(std::chrono::milliseconds(1000));
        topCard = playedCard;
        executeCardAction(topCard, &computerPlayer);
    }
    else
    {
        std::cout << "\nPC pulls a card from deck" << std::endl;
        std::this_thread::sleep_for(std::chrono::milliseconds(1000));

        Card drawnCard = deck.deal();
        if (drawnCard.canPlayOn(topCard))
        {
            std::cout << "PC throws: " << drawnCard.toString() << std::endl;
            std::this_thread::sleep_for(std::chrono::milliseconds(1000));
            topCard = drawnCard;
            executeCardAction(topCard, &computerPlayer);
        }
        else
        {
            std::cout << "PC doesn't have a valid card" << std::endl;
            std::this_thread::sleep_for(std::chrono::milliseconds(1000));
            computerPlayer.addCard(drawnCard);
            switchPlayer();
        }
    }

    std::cout << "\nPC has " << computerPlayer.getHandSize() << " cards remaining" << std::endl;
    std::this_thread::sleep_for(std::chrono::milliseconds(1000));

    if (computerPlayer.hasWon())
    {
        std::cout << "\nPC WON!!" << std::endl;
        gameRunning = false;
    }
}

void UnoGame::run()
{
    while (true)
    {
        std::cout << "Welcome to UNO! Finish your cards first to win" << std::endl;

        initializeGame();

        while (gameRunning)
        {
            playTurn();
        }

        char playAgain;
        std::cout << "Would you like to play again? (y/n): ";
        std::cin >> playAgain;

        if (playAgain != 'y' && playAgain != 'Y')
        {
            std::cout << "\nThanks for playing!!" << std::endl;
            break;
        }

        // Reset for new game
        humanPlayer = HumanPlayer();
        computerPlayer = ComputerPlayer();
    }
}