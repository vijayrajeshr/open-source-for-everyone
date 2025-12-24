🎵 Riddhesh's Music Library

An open-source, terminal-based music player written in **C**. This project manages a digital playlist using a doubly linked list and tracks your listening habits using a stack-based history system.


THE FEATURES :- 
 
  **Add Songs**: Input song titles, artists, and filenames to grow your collection.
   **Persistent Storage**: Automatically saves your playlist to `songs.txt` so your data is never lost.
   **Play Music**: Launches your local music files (e.g., `.mp3`) directly from the terminal.
   **Play History**: Keeps a "Most Recent First" list of every song you've listened to during your session.
   **Alphabetical Sorting**: Quickly organize your entire library from A to Z.

📂 Project Structure

  * `main.c`: The core logic and user menu.
  * `playlist.c` / `Playlist.h`: Implementation of the playlist and history data structures.
  * `songs/`: A dedicated folder to store your `.mp3` or audio files.
  * `songs.txt`: The text-based database for your music library.


🚀 How to Run

  1. Prerequisites

    Ensure you have a C compiler (like **GCC**) installed on your system.

  2. Compilation
    Open your terminal and run the following command to compile the source code:
    -->  gcc main.c playlist.c -o music_player

  3. Execution
     Run the compiled program:
     -->  ./music_player

  4. Adding Music
   To play a song through the player, make sure your audio file is placed inside the `songs/` folder. When adding a song in the menu, enter the filename exactly as it appears (e.g., `believer.mp3`).


📜 License
This project is licensed under the **MIT License** — feel free to use, modify, and share it!