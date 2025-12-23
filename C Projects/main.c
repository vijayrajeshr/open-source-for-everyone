#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "playlist.h"

void printMenu() {
    printf("\n---  Riddhesh's Music Library ---\n");
    printf("1. Add Song\n");
    printf("2. Display Playlist\n");
    printf("3. Play a Song\n");
    printf("4. View Play History\n");
    printf("5. Sort Playlist (A to Z)\n");
    printf("0. Exit\n");
    printf("------------------------------------\n");
    printf("Enter your choice: ");
}

int main() {
    const char* FILENAME = "songs.txt";

    Playlist* myPlaylist = createPlaylist();
    Stack* myHistory = createStack();

    loadSongsFromFile(myPlaylist, FILENAME);

    int choice, songIndex;
    char title[100], artist[100], filename[100];

    do {
        printMenu();
        scanf("%d", &choice);
        getchar();

        switch (choice) {
            case 1:
                printf("Enter song title: ");
                fgets(title, sizeof(title), stdin);
                title[strcspn(title, "\n")] = 0;

                printf("Enter artist: ");
                fgets(artist, sizeof(artist), stdin);
                artist[strcspn(artist, "\n")] = 0;

                printf("Enter filename (e.g., song.mp3): ");
                fgets(filename, sizeof(filename), stdin);
                filename[strcspn(filename, "\n")] = 0;

                addSong(myPlaylist, title, artist, filename);
                savePlaylistToFile(myPlaylist, FILENAME);
                printf("✅ Song added successfully!\n");
                break;

            case 2:
                displayPlaylist(myPlaylist);
                break;

            case 3:
                displayPlaylist(myPlaylist);
                printf("Enter song number to play: ");
                scanf("%d", &songIndex);
                playSong(myPlaylist, myHistory, songIndex);
                break;

            case 4:
                displayHistory(myHistory);
                break;

            case 5:
                displaySorted(myPlaylist);
                break;

            case 0:
                printf(" Saving playlist and exiting...\n");
                savePlaylistToFile(myPlaylist, FILENAME);
                break;

            default:
                printf("Invalid choice!\n");
        }
    } while (choice != 0);

    freePlaylist(myPlaylist);
    freeHistory(myHistory);

    return 0;
}
