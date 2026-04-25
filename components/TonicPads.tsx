import { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { AudioPlayer } from 'expo-audio';

const { width } = Dimensions.get('window');

interface TonicPad {
  name: string;
  player: AudioPlayer | null;
}

interface TonicPadsProps {
  tonics: TonicPad[];
  activeIndex: number | null;
  onToggle: (index: number) => void;
  onStop: () => void;
}

export default function TonicPads({ tonics, activeIndex, onToggle, onStop }: TonicPadsProps) {
  const handlePress = useCallback((index: number) => {
    if (activeIndex === index) {
      onStop();
    } else {
      onToggle(index);
    }
  }, [activeIndex, onToggle, onStop]);

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={1}
    >
      {tonics.map((tonic, index) => {
        const isActive = activeIndex === index;
        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.pad,
              isActive ? styles.padActive : null,
            ]}
            onPress={() => handlePress(index)}
            activeOpacity={0.7}
          >
            <Text style={[styles.text, isActive ? styles.textActive : null]}>
              {tonic.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  pad: {
    width: (width - 48) / 4,
    height: (width - 48) / 4,
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  padActive: {
    backgroundColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  text: {
    color: '#aaa',
    fontSize: 16,
    fontWeight: '600',
  },
  textActive: {
    color: '#fff',
  },
});