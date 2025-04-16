import React, { useState, useCallback, useRef } from 'react';
import { StyleSheet, ScrollView, ImageBackground, Dimensions, Text, View } from 'react-native';
import Phase from './components/Phase';
import phasesData from './data/phases.json';
import Button from './components/Button';
import AddPhaseModal from './components/AddPhaseModal';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

const App = () => {
  const [phases, setPhases] = useState(phasesData);
  const [isAddPhaseModalVisible, setIsAddPhaseModalVisible] = useState(false);
  const [phaseLayouts, setPhaseLayouts] = useState({});
  const scrollViewRef = useRef(null);
  const lastMoveTimestamp = useRef(0);
  
  const handleAddPhase = (newPhase) => {
    setPhases(currentPhases => [...currentPhases, newPhase]);
  };

  const handleUpdatePhase = (updatedPhase) => {
    setPhases(currentPhases =>
      currentPhases.map(phase =>
        phase.id === updatedPhase.id ? updatedPhase : phase
      )
    );
  };

  const handleDeletePhase = (phaseId) => {
    setPhases(currentPhases =>
      currentPhases.filter(phase => phase.id !== phaseId)
    );
  };

  const handlePhaseLayoutChange = useCallback((phaseId, layout) => {
    setPhaseLayouts(prevLayouts => ({
      ...prevLayouts,
      [phaseId]: layout
    }));
  }, []);

  const findPhaseAtPosition = useCallback((position) => {
    // Sort layouts by timestamp to get the most recent measurements first
    const phaseEntries = Object.entries(phaseLayouts).sort((a, b) => 
      (b[1].timestamp || 0) - (a[1].timestamp || 0)
    );

    for (const [phaseId, layout] of phaseEntries) {
      if (
        position.x >= layout.x && 
        position.x <= layout.right &&
        position.y >= layout.y && 
        position.y <= layout.bottom
      ) {
        return phaseId;
      }
    }
    return null;
  }, [phaseLayouts]);

  const handleMoveCard = useCallback((card, sourcePhaseId, targetPhaseId, translateX, translateY, position) => {
    const currentTime = Date.now();
    // Throttle updates to prevent excessive re-renders
    if (currentTime - lastMoveTimestamp.current < 50) {
      return;
    }
    lastMoveTimestamp.current = currentTime;

    if (position) {
      const newPhaseId = findPhaseAtPosition(position);
      
      if (!newPhaseId || newPhaseId === sourcePhaseId) {
        // Reset highlighting if not over a new phase
        setPhases(currentPhases =>
          currentPhases.map(phase => ({
            ...phase,
            isTargetPhase: false
          }))
        );
        return;
      }

      setPhases(currentPhases => {
        const sourcePhase = currentPhases.find(p => p.id === sourcePhaseId);
        const targetPhase = currentPhases.find(p => p.id === newPhaseId);
        
        if (!sourcePhase || !targetPhase) return currentPhases;
        
        // Check if card is already in target phase
        if (targetPhase.cards?.some(c => c.id === card.id)) {
          return currentPhases;
        }

        return currentPhases.map(phase => {
          if (phase.id === sourcePhaseId) {
            return {
              ...phase,
              cards: phase.cards.filter(c => c.id !== card.id),
              isTargetPhase: false
            };
          }
          if (phase.id === newPhaseId) {
            return {
              ...phase,
              cards: [...(phase.cards || []), card],
              isTargetPhase: true
            };
          }
          return {
            ...phase,
            isTargetPhase: false
          };
        });
      });
    }
  }, [findPhaseAtPosition]);

  const handleUpdateCard = useCallback((updatedCard, phaseId) => {
    setPhases(currentPhases =>
      currentPhases.map(phase => {
        if (phase.id === phaseId) {
          return {
            ...phase,
            cards: phase.cards.map(card =>
              card.id === updatedCard.id ? updatedCard : card
            )
          };
        }
        return phase;
      })
    );
  }, []);

  return (
    <ImageBackground source={require('./assets/background.jpg')} style={styles.backgroundImage} resizeMode="stretch">
      <View style={styles.overlay}>
        <Text style={styles.title}>MW - TODO</Text>
        <ScrollView 
          ref={scrollViewRef}
          style={styles.container}
          scrollEventThrottle={16}
        >
          {phases.map(phase => (
            <Phase
              key={phase.id}
              phase={phase}
              onUpdatePhase={handleUpdatePhase}
              onDeletePhase={handleDeletePhase}
              onMoveCard={handleMoveCard}
              onUpdateCard={handleUpdateCard}
              phases={phases}
              onLayoutChange={handlePhaseLayoutChange}
            />
          ))}
          <Button 
            title="+ Add phase"
            onPress={() => setIsAddPhaseModalVisible(true)}
          />
        </ScrollView>

        <AddPhaseModal
          isVisible={isAddPhaseModalVisible}
          onClose={() => setIsAddPhaseModalVisible(false)}
          onSave={handleAddPhase}
        />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 48,
    marginBottom: 6
  },
  container: {
    width: '100%',
    padding: 16,
    maxWidth: 800,
    flex: 1,
    alignSelf: 'center'
  },
  backgroundImage: {
    height: screenHeight,
    width: screenWidth
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    width: '100%',
    alignItems: 'center'
  }
});

export default App;
