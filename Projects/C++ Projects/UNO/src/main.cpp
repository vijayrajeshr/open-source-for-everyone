#include "UnoGame.h"
#include <iostream>
#include <exception>

int main()
{
    try
    {
        UnoGame game;
        game.run();
    }
    catch (const std::exception &e)
    {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }

    return 0;
}