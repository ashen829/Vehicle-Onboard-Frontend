import { View, Text,TextInput, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { Picker } from '@react-native-picker/picker';

const AddVehicle = () => {
  const [vehicleName, setVehicleName] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [transmission, setTransmission] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add Vehicle</Text>

      <TextInput
        style={styles.input}
        placeholder="Vehicle Name"
        value={vehicleName}
        onChangeText={setVehicleName}
      />

      <TextInput
        style={styles.input}
        placeholder="Model"
        value={model}
        onChangeText={setModel}
      />

      <TextInput
        style={styles.input}
        placeholder="Color"
        value={color}
        onChangeText={setColor}
      />

      <TextInput
        style={styles.input}
        placeholder="Plate Number"
        value={plateNumber}
        onChangeText={setPlateNumber}
      />

      <Text style={styles.label}>Fuel Type</Text>
      <Picker
        selectedValue={fuelType}
        onValueChange={(itemValue) => setFuelType(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select Fuel Type" value="" />
        <Picker.Item label="Petrol" value="petrol" />
        <Picker.Item label="Diesel" value="diesel" />
        <Picker.Item label="Electric" value="electric" />
      </Picker>

      <Text style={styles.label}>Transmission</Text>
      <Picker
        selectedValue={transmission}
        onValueChange={(itemValue) => setTransmission(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select Transmission" value="" />
        <Picker.Item label="Manual" value="manual" />
        <Picker.Item label="Automatic" value="automatic" />
      </Picker>
    </View>
  );
};

export default AddVehicle;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  label: {
    marginTop: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 6,
    marginBottom: 12,
  },
});
