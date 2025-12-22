#ifndef PLAYLIST_H
#define PLAYLIST_H

#include <stdio.h>

/* --- Song Node --- */
typedef struct SongNode {
    char title[100];
    char artist[100];
    char filename[100];  // File name of the song (e.g., song.mp3)
    struct SongNode* next;
    struct SongNode* prev;
} SongNode;

/* --- Playlist --- */
typedef struct Playlist {
    SongNode* head;
    SongNode* tail;
    int count;
} Playlist;

/* --- History Stack --- */
typedef struct HistoryNode {
    char title[100];
    struct HistoryNode* next;
} HistoryNode;

typedef struct Stack {
    HistoryNode* top;
} Stack;

/* --- Playlist Functions --- */
Playlist* createPlaylist();
void addSong(Playlist* pl, const char* title, const char* artist, const char* filename);
void displayPlaylist(Playlist* pl);
void displaySorted(Playlist* pl);
SongNode* getSongAtIndex(Playlist* pl, int index);

/* --- File Operations --- */
void loadSongsFromFile(Playlist* pl, const char* filename);
void savePlaylistToFile(Playlist* pl, const char* filename);

/* --- Play Song --- */
void playSong(Playlist* pl, Stack* history, int songNumber);

/* --- History Stack --- */
Stack* createStack();
void pushToHistory(Stack* history, const char* title);
void displayHistory(Stack* history);

/* --- Cleanup --- */
void freePlaylist(Playlist* pl);
void freeHistory(Stack* history);

#endif // PLAYLIST_H
