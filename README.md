# Five Crowns Progress Tracker

A modern, responsive web application for tracking scores and progress in the Five Crowns card game.

## Features

### 🎮 Game Management
- Add up to 6 players per game
- Track scores across all 11 rounds
- Visual indication of current round and wild cards
- Easy score input with touch-friendly interface

### 📊 Score Tracking
- Interactive scorecard with click-to-edit functionality
- Number pad for quick score entry on mobile devices
- Automatic total calculation
- Round-by-round progress visualization

### 📈 Statistics & History
- Complete game history with timestamps
- Player statistics including:
  - Games played and win rate
  - Average and best scores
  - Head-to-head performance
- Persistent data storage using localStorage

### 📱 Progressive Web App
- Works offline after first load
- Installable on mobile devices
- Responsive design for all screen sizes
- Touch-optimized interface

## Game Rules Reference

Five Crowns is played over 11 rounds with the following structure:

| Round | Cards Dealt | Wild Card |
|-------|-------------|-----------|
| 1     | 3           | 3s        |
| 2     | 4           | 4s        |
| 3     | 5           | 5s        |
| 4     | 6           | 6s        |
| 5     | 7           | 7s        |
| 6     | 8           | 8s        |
| 7     | 9           | 9s        |
| 8     | 10          | 10s       |
| 9     | 11          | Jacks     |
| 10    | 12          | Queens    |
| 11    | 13          | Kings     |

## How to Use

### Starting a Game
1. Navigate to the "Game" tab
2. Add players by entering names and clicking "Add Player"
3. Click "Start Game" when you have 2-6 players

### Entering Scores
1. After each round, enter scores for all players
2. Click "Submit Round" to save scores
3. Click "Next Round" to advance to the next round
4. You can edit previous scores by clicking on them in the scorecard

### Viewing History and Stats
- Switch to the "History" tab to see past games
- Switch to the "Stats" tab to view player statistics

## Technical Details

### Files Structure
- `index.html` - Main application structure
- `styles.css` - Responsive styling with card game theme
- `script.js` - Core application logic and game management
- `manifest.json` - PWA configuration
- `sw.js` - Service worker for offline functionality

### Browser Compatibility
- Modern browsers with ES6+ support
- Mobile Safari, Chrome, Firefox
- Progressive enhancement for older browsers

### Data Storage
- Uses localStorage for persistent data
- No server required - runs entirely client-side
- Data includes game history and player statistics

## Installation

### Local Development
1. Clone or download the project files
2. Open `index.html` in a web browser
3. Or serve using a local web server:
   ```bash
   python -m http.server 8000
   # or
   npx serve .
   ```

### Mobile Installation
1. Open the website in a mobile browser
2. Use "Add to Home Screen" option
3. The app will work offline after installation

## Customization

The app can be easily customized by modifying:
- Colors and themes in `styles.css`
- Game rules and scoring in `script.js`
- PWA settings in `manifest.json`

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the MIT License.
