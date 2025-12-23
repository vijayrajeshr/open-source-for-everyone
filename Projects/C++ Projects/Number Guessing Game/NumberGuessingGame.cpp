#include <iostream>
using namespace std;
int main()
{
    string choice;
    do
    {
        cout << "Enter a number betweem 0 and 10:";
        int n;
        cin >> n;
        int numGen = rand() % 11;
        if (numGen == n)
        {
            cout << "Hurray! Correct Guess"<<endl;
        }
        else
        {
            cout << "You might want to try again :("<<endl;
        }
        cout << "Do you want to play again?"<<endl;
        cin >> choice;
    } while(choice[0]=='y' || choice[0] =='Y');
    return 0;
}