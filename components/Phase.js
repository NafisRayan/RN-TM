import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import Card from './Card';
import Button from './Button';
import AddCardModal from './AddCardModal';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Phase = ({ phase, onUpdatePhase, onDeletePhase, onMoveCard, onUpdateCard, phases, onLayoutChange }) => {
  const [isAddCardModalVisible, setIsAddCardModalVisible] = useState(false);
  const phaseRef = useRef(null);
  
  const updateMeasurements = useCallback(() => {
    if (phaseRef.current && onLayoutChange) {
      requestAnimationFrame(() => {
        phaseRef.current.measure((x, y, width, height, pageX, pageY) => {
          const bounds = {
            id: phase.id,
            x: pageX,
            y: pageY,
            width,
            height,
            right: pageX + width,
            bottom: pageY + height,
            timestamp: Date.now()
          };
          onLayoutChange(phase.id, bounds);
        });
      });
    }
  }, [phase.id, onLayoutChange]);

  const handleLayout = useCallback(() => {
    updateMeasurements();
  }, [updateMeasurements]);

  const handleAddCard = (newCard) => {
    const updatedPhase = {
      ...phase,
      cards: [...(phase.cards || []), newCard]
    };
    onUpdatePhase(updatedPhase);
  };

  const handleUpdateCard = (updatedCard) => {
    const updatedCards = phase.cards.map(card => 
      card.id === updatedCard.id ? updatedCard : card
    );
    onUpdatePhase({ ...phase, cards: updatedCards });
    onUpdateCard && onUpdateCard(updatedCard, phase.id);
  };

  const handleDeleteCard = (cardId) => {
    const updatedCards = phase.cards.filter(card => card.id !== cardId);
    onUpdatePhase({ ...phase, cards: updatedCards });
  };

  return (
    <View 
      ref={phaseRef}
      onLayout={handleLayout}
      style={styles.phaseWrapper}
    >
      <View style={[
        styles.container,
        phase.isTargetPhase && styles.targetPhase
      ]}>
        <View style={styles.header}>
          <Text style={styles.title}>{phase.title}</Text>
          <Pressable onPress={() => onDeletePhase(phase.id)} style={styles.deleteButton}>
            <Icon name="delete" size={24} color="#fff" />
          </Pressable>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.scrollContent}
          onScroll={updateMeasurements}
          scrollEventThrottle={16}
        >
          {phase.cards?.map(card => (
            <Card
              key={card.id}
              card={card}
              phaseId={phase.id}
              onUpdate={handleUpdateCard}
              onDelete={handleDeleteCard}
              onMoveCard={onMoveCard}
              phases={phases}
            />
          ))}
          <Button 
            title="+ Add card"
            onPress={() => setIsAddCardModalVisible(true)}
          />
        </ScrollView>
      </View>

      <AddCardModal
        isVisible={isAddCardModalVisible}
        onClose={() => setIsAddCardModalVisible(false)}
        onSave={handleAddCard}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  phaseWrapper: {
    width: '100%',
    marginBottom: 16,
  },
  container: {
    width: '100%',
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    minHeight: 100,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  targetPhase: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderColor: '#4CAF50',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flexShrink: 1,
    marginRight: 8,
  },
  deleteButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 10,
  },
});

export default Phase;
