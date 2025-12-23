#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "playlist.h"

Playlist* createPlaylist() {
    Playlist* pl = (Playlist*)malloc(sizeof(Playlist));
    pl->head = pl->tail = NULL;
    pl->count = 0;
    return pl;
}

void addSong(Playlist* pl, const char* title, const char* artist, const char* filename) {
    SongNode* newSong = (SongNode*)malloc(sizeof(SongNode));
    strcpy(newSong->title, title);
    strcpy(newSong->artist, artist);
    strcpy(newSong->filename, filename);
    newSong->next = newSong->prev = NULL;

    if (!pl->head) {
        pl->head = pl->tail = newSong;
    } else {
        pl->tail->next = newSong;
        newSong->prev = pl->tail;
        pl->tail = newSong;
    }
    pl->count++;
}

SongNode* getSongAtIndex(Playlist* pl, int index) {
    if (!pl || index < 1 || index > pl->count) return NULL;
    SongNode* cur = pl->head;
    for (int i = 1; i < index; i++)
        cur = cur->next;
    return cur;
}

void displayPlaylist(Playlist* pl) {
    if (!pl || !pl->head) {
        printf("Playlist is empty.\n");
        return;
    }
    printf("\n--- My Playlist (%d songs) ---\n", pl->count);
    SongNode* cur = pl->head;
    int i = 1;
    while (cur) {
        printf("%d. %s - %s\n", i++, cur->title, cur->artist);
        cur = cur->next;
    }
    printf("-----------------------------\n");
}

void displaySorted(Playlist* pl) {
    if (!pl || pl->count == 0) {
        printf("Playlist is empty.\n");
        return;
    }

    int n = pl->count;
    char** titles = malloc(n * sizeof(char*));
    SongNode* cur = pl->head;
    for (int i = 0; i < n; i++) {
        titles[i] = strdup(cur->title);
        cur = cur->next;
    }

    int cmp(const void* a, const void* b) {
        return strcmp(*(const char**)a, *(const char**)b);
    }
    qsort(titles, n, sizeof(char*), cmp);

    printf("\n--- Sorted Playlist ---\n");
    for (int i = 0; i < n; i++) {
        printf("%d. %s\n", i + 1, titles[i]);
        free(titles[i]);
    }
    free(titles);
    printf("-----------------------\n");
}

/* --- History Stack --- */
Stack* createStack() {
    Stack* s = malloc(sizeof(Stack));
    s->top = NULL;
    return s;
}

void pushToHistory(Stack* history, const char* title) {
    HistoryNode* node = malloc(sizeof(HistoryNode));
    strcpy(node->title, title);
    node->next = history->top;
    history->top = node;
}

void displayHistory(Stack* history) {
    if (!history || !history->top) {
        printf("No songs played yet.\n");
        return;
    }
    printf("\n--- Play History (Most Recent First) ---\n");
    HistoryNode* cur = history->top;
    while (cur) {
        printf("- %s\n", cur->title);
        cur = cur->next;
    }
    printf("----------------------------------------\n");
}

/* --- File I/O --- */
void loadSongsFromFile(Playlist* pl, const char* filename) {
    FILE* file = fopen(filename, "r");
    if (!file) {
        printf("⚠️ Could not open %s\n", filename);
        return;
    }

    char title[100], artist[100], songfile[100];
    while (fscanf(file, "%99[^,],%99[^,],%99[^\n]\n", title, artist, songfile) == 3) {
        addSong(pl, title, artist, songfile);
    }
    fclose(file);
}

void savePlaylistToFile(Playlist* pl, const char* filename) {
    FILE* fp = fopen(filename, "w");
    if (!fp) {
        perror("fopen");
        return;
    }
    SongNode* cur = pl->head;
    while (cur) {
        fprintf(fp, "%s,%s,%s\n", cur->title, cur->artist, cur->filename);
        cur = cur->next;
    }
    fclose(fp);
}

/* --- Play Song --- */
void playSong(Playlist* pl, Stack* history, int songNumber) {
    SongNode* song = getSongAtIndex(pl, songNumber);
    if (!song) {
        printf("Invalid song number!\n");
        return;
    }

    printf("Now Playing: %s - %s\n", song->title, song->artist);

    char command[256];
    snprintf(command, sizeof(command), "start songs/%s", song->filename);
    system(command);

    pushToHistory(history, song->title);
}

/* --- Cleanup --- */
void freePlaylist(Playlist* pl) {
    SongNode* cur = pl->head;
    while (cur) {
        SongNode* next = cur->next;
        free(cur);
        cur = next;
    }
    free(pl);
}

void freeHistory(Stack* history) {
    HistoryNode* cur = history->top;
    while (cur) {
        HistoryNode* next = cur->next;
        free(cur);
        cur = next;
    }
    free(history);
}
