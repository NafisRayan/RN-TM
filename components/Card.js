import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, PanResponder, Platform, UIManager } from 'react-native';
import EditCardModal from './EditCardModal';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Card = ({ card, onUpdate, onDelete, phaseId, onMoveCard, phases }) => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const pan = useRef(new Animated.ValueXY()).current;
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef(null);
  const initialPosition = useRef({ x: 0, y: 0 });
  const currentPhaseId = useRef(phaseId);

  const resetPosition = useCallback(() => {
    Animated.spring(pan, {
      toValue: { x: 0, y: 0 },
      tension: 300,
      friction: 5,
      useNativeDriver: false
    }).start();
  }, [pan]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (e, gestureState) => {
        setIsDragging(true);
        initialPosition.current = {
          x: gestureState.x0,
          y: gestureState.y0
        };
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (e, gestureState) => {
        const position = {
          x: initialPosition.current.x + gestureState.dx,
          y: initialPosition.current.y + gestureState.dy
        };

        // Update card position
        Animated.event(
          [null, { dx: pan.x, dy: pan.y }],
          { useNativeDriver: false }
        )(e, gestureState);

        // Check for phase changes
        if (cardRef.current && onMoveCard) {
          cardRef.current.measure((x, y, width, height, pageX, pageY) => {
            const cardCenter = {
              x: pageX + width / 2 + gestureState.dx,
              y: pageY + height / 2 + gestureState.dy
            };
            
            onMoveCard(card, currentPhaseId.current, null, gestureState.dx, gestureState.dy, cardCenter);
          });
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        setIsDragging(false);
        pan.flattenOffset();

        // Update current phase ID if changed
        if (currentPhaseId.current !== phaseId) {
          currentPhaseId.current = phaseId;
        }

        resetPosition();
      }
    })
  ).current;

  return (
    <>
      <Animated.View
        ref={cardRef}
        style={[
          styles.container,
          isDragging && styles.dragging,
          { transform: pan.getTranslateTransform() }
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.cardContent}>
          <Text style={styles.title}>{card.title}</Text>
          <Text style={styles.description}>{card.description}</Text>
        </View>
        <View style={styles.actions}>
          <Pressable onPress={() => setIsEditModalVisible(true)} style={styles.actionButton}>
            <Icon name="edit" size={20} color="#007bff" />
          </Pressable>
          <Pressable onPress={() => onDelete(card.id)} style={styles.actionButton}>
            <Icon name="delete" size={20} color="#dc3545" />
          </Pressable>
        </View>
      </Animated.View>

      <EditCardModal
        isVisible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onSave={onUpdate}
        card={card}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 5,
    marginVertical: 4,
    backgroundColor: '#ffffff',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    minHeight: 60,
    flexWrap: 'wrap'
  },
  dragging: {
    opacity: 0.7,
    zIndex: 999,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.32,
    shadowRadius: 5.46,
    elevation: 9,
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  cardContent: {
    flex: 1,
    minWidth: 150,
    marginRight: 4
  },
  title: {
    fontSize: 15,
    marginBottom: 4,
    flexWrap: 'wrap',
    fontWeight: '500'
  },
  description: {
    fontSize: 12,
    color: '#666',
    flexWrap: 'wrap',
    maxWidth: '100%'
  },
  actions: {
    flexDirection: 'row',
    marginLeft: 4,
    flexShrink: 0,
    alignSelf: 'flex-start'
  },
  actionButton: {
    padding: 4,
    marginLeft: 4
  }
});

export default Card;
