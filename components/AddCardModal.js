import React, { useState } from 'react';
import { Modal, View, TextInput, StyleSheet, Pressable, Text } from 'react-native';

const AddCardModal = ({ isVisible, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    if (title.trim()) {
      onSave({
        id: Date.now(),
        title: title.trim(),
        description: description.trim()
      });
      setTitle('');
      setDescription('');
      onClose();
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Add New Card</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Card Title"
            placeholderTextColor="#666"
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Card Description"
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
          />
          <View style={styles.buttonContainer}>
            <Pressable style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
            <Pressable 
              style={[styles.button, styles.saveButton, !title.trim() && styles.disabledButton]} 
              onPress={handleSave}
              disabled={!title.trim()}
            >
              <Text style={styles.buttonText}>Add</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalView: {
    width: '90%',
    maxWidth: 500,
    minWidth: 280,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
    elevation: 5
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    width: '100%',
    minHeight: 40
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    marginHorizontal: 5,
    minWidth: 100
  },
  cancelButton: {
    backgroundColor: '#6c757d'
  },
  saveButton: {
    backgroundColor: '#007bff'
  },
  disabledButton: {
    backgroundColor: '#ccc'
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16
  }
});

export default AddCardModal;
