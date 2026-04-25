# Aether Pads

A mobile app for controlling worship ambient pads (tonics) and electronic drum sample pads, designed for live worship performances.

## Features

### Tonic Pads
- 12 chromatic notes (C through B)
- Two sound modes: Foundation and Organic (switchable via toggle)
- Toggle on/off behavior for sustained ambient pads
- Visual feedback (glow effect when active)
- Single active pad at a time

### Drum Pads
- 6 one-shot percussion sounds: Kick, Snare, Hi-Hat, Clap, Tom, Crash
- Individual color selection (5 preset colors)
- Individual volume slider (0-100%)
- Long-press to reveal controls

### Layout
- Single screen with vertical stack layout
- Tonic pads at top (4x3 grid)
- Drum pads below (2x3 grid)
- Dark theme for stage-friendly visibility

## Tech Stack

- React Native + Expo (managed workflow)
- expo-audio for audio playback
- react-native-safe-area-context for safe area handling
- StyleSheet for styling
- TypeScript
- PanResponder for slider gestures

## Getting Started

### Prerequisites
- Node.js >= 18
- npm or yarn
- Expo CLI

### Installation

```bash
npm install
```

### Running

```bash
# Development
npx expo start

# iOS
npx expo start --ios

# Android
npx expo start --android
```

### Building

```bash
# Generate native projects
npx expo prebuild

# Build iOS
cd ios && xcodebuild -workspace aetherpads.xcworkspace -scheme aetherpads -configuration Debug build
```

## Usage

- **Tap tonic pad**: toggle on/off (loops until stopped)
- **Tap drum pad**: play one-shot sound
- **Long-press drum pad**: show color/volume controls
- **Toggle Foundation/Organic**: switch between two tonic sound banks

## Project Structure

```
aetherpads/
├── App.tsx                    # Main app component
├── assets/
│   └── sounds/
│       ├── tonics/           # Foundation tonic samples
│       ├── tonics/organic/    # Organic tonic samples
│       └── drums/           # Drum samples
├── components/               # Reusable components
├── SPEC.md                  # Detailed specification
└── ios/                    # Native iOS project
```

## Audio Assets

The app includes placeholder demo sounds. Replace files in `assets/sounds/` with your own samples:

- **Foundation pads**: `assets/sounds/tonics/*.mp3` (12 chromatic notes)
- **Organic pads**: `assets/sounds/tonics/organic/*.mp3`
- **Drums**: `assets/sounds/drums/*.mp3` (6 drum sounds)

## License

MIT