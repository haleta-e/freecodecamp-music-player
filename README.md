🎵 JavaScript Music Player

A responsive, accessible browser-based music player built with HTML, CSS, and vanilla JavaScript, starting from the FreeCodeCamp JavaScript Certification music player workshop.

✨ Features
Core Features
Play and pause songs.
Navigate to the next and previous songs.
Display the current song title and artist.
Highlight the currently playing song in the playlist.
Automatically play the next song when the current song ends.
Update accessible labels for player controls.
Manage playback state using JavaScript.
Enhancements
Responsive, modern user interface (desktop and mobile layouts).
Album artwork and an improved playlist with durations.
Interactive playback progress bar with seeking and live time display.
Volume slider and mute toggle (remembered between visits).
Shuffle and repeat modes (off / repeat all / repeat one).
Search by song title or artist, plus a "Favorites" filter.
Favorite songs with persistent storage (localStorage).
Keyboard shortcuts, visible focus states, and screen-reader announcements.
🛠️ Technologies
HTML5: Page structure and semantic landmarks.
CSS3: Styling, custom properties, layout, and responsive design.
JavaScript (ES6+): Playback logic, event handling, DOM manipulation, and application state.
Browser Audio API: Audio playback and media events.
localStorage: Persistence for favorites and preferences (volume, mute, shuffle, repeat).
Media Session API: Lock-screen and headphone controls where supported.
📁 Project Structure
text
freecodecamp-music-player/
├── index.html
├── styles.css
├── script.js
└── README.md
🚀 Getting Started
Prerequisites

A modern web browser and a code editor such as Visual Studio Code.

Installation
Clone the repository:
bash
   git clone https://github.com/YOUR-USERNAME/freecodecamp-music-player.git
Open the project folder:
bash
   cd freecodecamp-music-player
Open index.html in your browser (or use the Live Server extension in VS Code).

Replace YOUR-USERNAME with your GitHub username.

🎧 How to Use
Select a song from the playlist, or press Play.
Drag the progress bar to seek; drag the volume slider to adjust sound.
Use Shuffle and Repeat to change what plays next.
Tap the heart on a song to favorite it, and use the Favorites chip to show only favorites.
Type in the search box to filter by title or artist (press Esc to clear).
Keyboard Shortcuts
Key	Action
Space	Play / pause
← / →	Seek back / forward 5 seconds
↑ / ↓	Volume up / down
N / P	Next / previous song
S	Toggle shuffle
R	Cycle repeat (off → all → one)
M	Mute / unmute
F	Favorite the current song
/	Focus the search box

Shortcuts are disabled while you are typing in the search box.

🧠 Learning Objectives
JavaScript functions and arrow functions.
Arrays, objects, and array methods such as find(), filter(), and indexOf().
DOM selection, manipulation, and event delegation.
Event listeners and callback functions.
HTML audio playback and media events (timeupdate, ended, loadedmetadata).
Conditional logic and application state.
Persisting data with localStorage.
Accessibility attributes such as aria-label, aria-pressed, aria-current, and live regions.
Responsive web design and CSS layout.
🗺️ Development Roadmap
 Implement core music player functionality.
 Display the current song information.
 Highlight the active playlist item.
 Automatically advance when a song ends.
 Improve the visual design.
 Add playback progress and seeking.
 Add volume controls.
 Implement shuffle and repeat.
 Add playlist search.
 Add persistent favorites.
 Test accessibility and responsive behavior.

The last item is implemented but still needs your manual verification — see the checklist below, then tick it off.

Testing Checklist
 Tab through every control with the keyboard; focus outline is always visible.
 Every button announces a meaningful label in a screen reader (e.g. NVDA, VoiceOver).
 Layout works at 320px, 375px, 768px and desktop widths.
 Seeking, volume, shuffle, repeat and favorites work after a page reload.
 Search with no matches shows the empty message.
♿ Accessibility
Buttons have descriptive aria-labels; toggles use aria-pressed.
The current song is marked with aria-current="true".
Sliders expose human-readable aria-valuetext (for example, "0:12 of 0:23").
A live region announces song changes, shuffle/repeat state, mute state, and errors.
Visible focus outlines, a skip link, and full keyboard control.
Animations are disabled for users who prefer reduced motion.
🔮 Future Improvements

Custom playlists, drag-and-drop reordering, a queue view, and a light theme.

👩‍💻 Author

Etsegenet Amsalu

Computer Science Student | Frontend Developer

GitHub: haleta-e

📜 Acknowledgments
FreeCodeCamp for the JavaScript certification and music player workshop.
The open-source web development community for learning resources and inspiration.
📄 License

This project is intended for learning and portfolio development. A license can be added when the project distribution terms have been decided..
