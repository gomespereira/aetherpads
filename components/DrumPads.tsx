import { useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { AudioPlayer } from 'expo-audio';

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

interface DrumPad {
  name: string;
  player: AudioPlayer | null;
}

interface DrumSettings {
  color: string;
  volume: number;
}

interface DrumPadsProps {
  drums: DrumPad[];
  settings: DrumSettings[];
  onPlay: (index: number, volume: number) => void;
  onColorChange: (index: number, color: string) => void;
  onVolumeChange: (index: number, volume: number) => void;
}

export default function DrumPads({
  drums,
  settings,
  onPlay,
  onColorChange,
  onVolumeChange,
}: DrumPadsProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handlePress = useCallback((index: number) => {
    const { volume } = settings[index];
    onPlay(index, volume / 100);
  }, [settings, onPlay]);

  const handleLongPress = useCallback((index: number) => {
    setExpandedIndex(current => current === index ? null : index);
  }, []);

  const handleColorSelect = useCallback((index: number, color: string) => {
    onColorChange(index, color);
  }, [onColorChange]);

  const handleVolumeSelect = useCallback((index: number, volume: number) => {
    onVolumeChange(index, volume);
  }, [onVolumeChange]);

  return (
    <View style={styles.container}>
      {drums.map((drum, index) => {
        const { color, volume } = settings[index];
        const isExpanded = expandedIndex === index;

        return (
          <View key={index} style={styles.padContainer}>
            <TouchableOpacity
              style={[styles.pad, { backgroundColor: color }]}
              onPress={() => handlePress(index)}
              onLongPress={() => handleLongPress(index)}
              activeOpacity={0.7}
            >
              <Text style={styles.padText}>{drum.name}</Text>
            </TouchableOpacity>

            {isExpanded && (
              <View style={styles.controls}>
                <View style={styles.colorRow}>
                  {COLORS.map((c, colorIndex) => (
                    <TouchableOpacity
                      key={colorIndex}
                      style={[
                        styles.colorOption,
                        { backgroundColor: c },
                        color === c ? styles.colorSelected : null,
                      ]}
                      onPress={() => handleColorSelect(index, c)}
                    />
                  ))}
                </View>

                <View style={styles.volumeRow}>
                  <Text style={styles.volumeLabel}>Vol</Text>
                  <View style={styles.volumeSlider}>
                    {[0, 25, 50, 75, 100].map(v => (
                      <TouchableOpacity
                        key={v}
                        style={[
                          styles.volumeButton,
                          volume >= v ? { backgroundColor: color } : null,
                        ]}
                        onPress={() => handleVolumeSelect(index, v)}
                      />
                    ))}
                  </View>
                </View>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  padContainer: {
    width: '48%',
    marginBottom: 12,
  },
  pad: {
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  padText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  controls: {
    marginTop: 8,
    backgroundColor: '#2d2d44',
    borderRadius: 8,
    padding: 12,
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  volumeLabel: {
    color: '#888',
    fontSize: 12,
    marginRight: 8,
    width: 24,
  },
  volumeSlider: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  volumeButton: {
    width: 36,
    height: 24,
    backgroundColor: '#444',
    borderRadius: 4,
  },
});