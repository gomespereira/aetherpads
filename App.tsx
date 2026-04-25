import { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, Dimensions, PanResponder } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useAudioPlayer } from 'expo-audio';

const { width } = Dimensions.get('window');

function VolumeSlider({ volume, color, onChange, trackWidth }: { volume: number; color: string; onChange: (v: number) => void; trackWidth: number }) {
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const w = trackWidth || 100;
        const vol = Math.round((e.nativeEvent.locationX / w) * 100);
        onChange(Math.max(0, Math.min(100, vol)));
      },
      onPanResponderMove: (e) => {
        const w = trackWidth || 100;
        const vol = Math.round((e.nativeEvent.locationX / w) * 100);
        onChange(Math.max(0, Math.min(100, vol)));
      },
    })
  ).current;

  return (
    <View style={styles.sliderTouchArea} {...panResponder.panHandlers}>
      <View style={styles.sliderTrack}>
        <View style={[styles.sliderFill, { width: `${volume}%`, backgroundColor: color }]} />
        <View style={[styles.sliderThumb, { left: `${Math.max(0, volume - 6)}%` }]} />
      </View>
    </View>
  );
}

const FOUNDATION_TONICS = [
  { name: 'C', file: require('./assets/sounds/tonics/foundation/C.mp3') },
  { name: 'Db', file: require('./assets/sounds/tonics/foundation/Db.mp3') },
  { name: 'D', file: require('./assets/sounds/tonics/foundation/D.mp3') },
  { name: 'Eb', file: require('./assets/sounds/tonics/foundation/Eb.mp3') },
  { name: 'E', file: require('./assets/sounds/tonics/foundation/E.mp3') },
  { name: 'F', file: require('./assets/sounds/tonics/foundation/F.mp3') },
  { name: 'Gb', file: require('./assets/sounds/tonics/foundation/Gb.mp3') },
  { name: 'G', file: require('./assets/sounds/tonics/foundation/G.mp3') },
  { name: 'Ab', file: require('./assets/sounds/tonics/foundation/Ab.mp3') },
  { name: 'A', file: require('./assets/sounds/tonics/foundation/A.mp3') },
  { name: 'Bb', file: require('./assets/sounds/tonics/foundation/Bb.mp3') },
  { name: 'B', file: require('./assets/sounds/tonics/foundation/B.mp3') },
];

const ORGANIC_TONICS = [
  { name: 'C', file: require('./assets/sounds/tonics/organic/C.mp3') },
  { name: 'Db', file: require('./assets/sounds/tonics/organic/Db.mp3') },
  { name: 'D', file: require('./assets/sounds/tonics/organic/D.mp3') },
  { name: 'Eb', file: require('./assets/sounds/tonics/organic/Eb.mp3') },
  { name: 'E', file: require('./assets/sounds/tonics/organic/E.mp3') },
  { name: 'F', file: require('./assets/sounds/tonics/organic/F.mp3') },
  { name: 'Gb', file: require('./assets/sounds/tonics/organic/Gb.mp3') },
  { name: 'G', file: require('./assets/sounds/tonics/organic/G.mp3') },
  { name: 'Ab', file: require('./assets/sounds/tonics/organic/Ab.mp3') },
  { name: 'A', file: require('./assets/sounds/tonics/organic/A.mp3') },
  { name: 'Bb', file: require('./assets/sounds/tonics/organic/Bb.mp3') },
  { name: 'B', file: require('./assets/sounds/tonics/organic/B.mp3') },
];

const DRUMS = [
  { name: 'Kick', file: require('./assets/sounds/drums/kick.wav') },
  { name: 'Snare', file: require('./assets/sounds/drums/snare.wav') },
  { name: 'Hi-Hat', file: require('./assets/sounds/drums/hihat.wav') },
  { name: 'Clap', file: require('./assets/sounds/drums/clap.mp3') },
  { name: 'Tom', file: require('./assets/sounds/drums/tom.wav') },
  { name: 'Crash', file: require('./assets/sounds/drums/crash.wav') },
];

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

function TonicPad({ name, player, isActive, onPress }: { name: string; player: any; isActive: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.tonicPad, isActive && styles.tonicPadActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.tonicText, isActive && styles.tonicTextActive]}>{name}</Text>
    </TouchableOpacity>
  );
}

function DrumPad({ name, player, color, volume, onPress, onLongPress }: { name: string; player: any; color: string; volume: number; onPress: () => void; onLongPress: () => void }) {
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const LONG_PRESS_DURATION = 500;

  const handlePressIn = () => {
    longPressTimer.current = setTimeout(() => {
      onLongPress();
    }, LONG_PRESS_DURATION);
  };

  const handlePressOut = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.drumPad, { backgroundColor: color }]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      delayLongPress={LONG_PRESS_DURATION}
      activeOpacity={0.7}
    >
      <Text style={styles.drumText}>{name}</Text>
    </TouchableOpacity>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTonic, setActiveTonic] = useState<number | null>(null);
  const [drumSettings, setDrumSettings] = useState<{ color: string; volume: number }[]>(
    DRUMS.map(() => ({ color: COLORS[0], volume: 100 }))
  );
  const [expandedDrum, setExpandedDrum] = useState<number | null>(null);
  const [trackWidths, setTrackWidths] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [tonicMode, setTonicMode] = useState<'foundation' | 'organic'>('foundation');

  const currentTonics = tonicMode === 'foundation' ? FOUNDATION_TONICS : ORGANIC_TONICS;

  const p0 = useAudioPlayer(currentTonics[0].file);
  const p1 = useAudioPlayer(currentTonics[1].file);
  const p2 = useAudioPlayer(currentTonics[2].file);
  const p3 = useAudioPlayer(currentTonics[3].file);
  const p4 = useAudioPlayer(currentTonics[4].file);
  const p5 = useAudioPlayer(currentTonics[5].file);
  const p6 = useAudioPlayer(currentTonics[6].file);
  const p7 = useAudioPlayer(currentTonics[7].file);
  const p8 = useAudioPlayer(currentTonics[8].file);
  const p9 = useAudioPlayer(currentTonics[9].file);
  const p10 = useAudioPlayer(currentTonics[10].file);
  const p11 = useAudioPlayer(currentTonics[11].file);
  const tonicPlayers = [p0, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11];

  const d0 = useAudioPlayer(DRUMS[0].file);
  const d1 = useAudioPlayer(DRUMS[1].file);
  const d2 = useAudioPlayer(DRUMS[2].file);
  const d3 = useAudioPlayer(DRUMS[3].file);
  const d4 = useAudioPlayer(DRUMS[4].file);
  const d5 = useAudioPlayer(DRUMS[5].file);
  const drumPlayers = [d0, d1, d2, d3, d4, d5];

  useEffect(() => {
    tonicPlayers.forEach(player => {
      if (player) player.loop = true;
    });
    setIsLoading(false);
  }, []);

  const handleTonicToggle = useCallback((index: number) => {
    if (activeTonic !== null && activeTonic !== index) {
      const prevPlayer = tonicPlayers[activeTonic];
      if (prevPlayer) prevPlayer.pause();
    }

    const player = tonicPlayers[index];
    if (activeTonic === index) {
      if (player) player.pause();
      setActiveTonic(null);
    } else {
      if (player) {
        player.seekTo(0);
        player.play();
      }
      setActiveTonic(index);
    }
  }, [activeTonic, tonicPlayers]);

  const handleDrumPlay = useCallback((index: number) => {
    const player = drumPlayers[index];
    const { volume } = drumSettings[index];
    if (player) {
      player.volume = volume / 100;
      player.seekTo(0);
      player.play();
    }
  }, [drumPlayers, drumSettings]);

  const handleDrumLongPress = useCallback((index: number) => {
    setExpandedDrum(current => current === index ? null : index);
  }, []);

  const handleColorChange = useCallback((index: number, color: string) => {
    setDrumSettings(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], color };
      return updated;
    });
  }, []);

  const handleVolumeChange = useCallback((index: number, volume: number) => {
    setDrumSettings(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], volume };
      return updated;
    });
  }, []);

  const handleTrackLayout = useCallback((index: number, w: number) => {
    setTrackWidths(prev => {
      const updated = [...prev];
      updated[index] = w;
      return updated;
    });
  }, []);

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.loadingContainer}>
          <StatusBar barStyle="light-content" />
          <Text style={styles.loadingText}>Loading sounds...</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Aether Pads</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tonic Pads</Text>
              <View style={styles.tonicToggle}>
                <TouchableOpacity
                  style={[styles.tonicToggleBtn, tonicMode === 'foundation' && styles.tonicToggleBtnActive]}
                  onPress={() => setTonicMode('foundation')}
                >
                  <Text style={[styles.tonicToggleText, tonicMode === 'foundation' && styles.tonicToggleTextActive]}>Foundation</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tonicToggleBtn, tonicMode === 'organic' && styles.tonicToggleBtnActive]}
                  onPress={() => setTonicMode('organic')}
                >
                  <Text style={[styles.tonicToggleText, tonicMode === 'organic' && styles.tonicToggleTextActive]}>Organic</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.tonicGrid}>
              {currentTonics.map((tonic, index) => (
                <TonicPad
                  key={index}
                  name={tonic.name}
                  player={tonicPlayers[index]}
                  isActive={activeTonic === index}
                  onPress={() => handleTonicToggle(index)}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Drum Pads</Text>
            </View>
            <View style={styles.drumGrid}>
              {DRUMS.map((drum, index) => {
                const { color, volume } = drumSettings[index];
                const isExpanded = expandedDrum === index;
                return (
                  <View key={index} style={styles.drumPadWrapper}>
                    <DrumPad
                      name={drum.name}
                      player={drumPlayers[index]}
                      color={color}
                      volume={volume}
                      onPress={() => handleDrumPlay(index)}
                      onLongPress={() => handleDrumLongPress(index)}
                    />
                    {isExpanded && (
                      <View style={styles.drumControls}>
                        <View style={styles.colorRow}>
                          {COLORS.map((c, i) => (
                            <TouchableOpacity
                              key={i}
                              style={[styles.colorOption, { backgroundColor: c }, color === c && styles.colorSelected]}
                              onPress={() => handleColorChange(index, c)}
                            />
                          ))}
                        </View>
                        <View style={styles.volumeRow}>
                          <Text style={styles.volumeLabel}>{volume}%</Text>
                          <View
                            style={styles.sliderContainer}
                            onLayout={(e) => handleTrackLayout(index, e.nativeEvent.layout.width)}
                          >
                            <VolumeSlider
                              volume={volume}
                              color={color}
                              trackWidth={trackWidths[index]}
                              onChange={(v) => handleVolumeChange(index, v)}
                            />
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
  },
  header: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  tonicToggle: {
    flexDirection: 'row',
    backgroundColor: '#2d2d44',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tonicToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tonicToggleBtnActive: {
    backgroundColor: '#6366f1',
  },
  tonicToggleText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
  },
  tonicToggleTextActive: {
    color: '#fff',
  },
  tonicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tonicPad: {
    width: (width - 48) / 4,
    height: (width - 48) / 4,
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  tonicPadActive: {
    backgroundColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  tonicText: {
    color: '#aaa',
    fontSize: 16,
    fontWeight: '600',
  },
  tonicTextActive: {
    color: '#fff',
  },
  drumGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  drumPadWrapper: {
    width: '48%',
    marginBottom: 12,
    overflow: 'hidden',
  },
  drumPad: {
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drumText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  drumControls: {
    marginTop: 8,
    backgroundColor: '#2d2d44',
    borderRadius: 8,
    padding: 8,
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  colorOption: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  colorSelected: {
    borderWidth: 2,
    borderColor: '#fff',
  },
volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    height: 28,
  },
  volumeLabel: {
    color: '#aaa',
    fontSize: 11,
    marginRight: 8,
    width: 32,
    textAlign: 'right',
  },
  sliderContainer: {
    flex: 1,
    height: 28,
    justifyContent: 'center',
  },
  sliderPressArea: {
    flex: 1,
    justifyContent: 'center',
  },
  sliderTouchArea: {
    height: 28,
    justifyContent: 'center',
  },
  sliderTrack: {
    height: 6,
    backgroundColor: '#444',
    borderRadius: 3,
    position: 'relative',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 6,
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    top: -5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginLeft: -8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
});
