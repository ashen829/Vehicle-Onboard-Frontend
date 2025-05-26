import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios, { formToJSON } from 'axios';
import { Picker } from '@react-native-picker/picker';



const tags = ['MAIN', 'FRONT', 'BACK', 'LEFT', 'RIGHT', 'DASHBOARD', 'BACKSEATS'];

const VehicleUploader = () => {
  const [makes, setMakes] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [filteredModels, setFilteredModels] = useState<any[]>([]);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    regNo: '',
    modelId: '',
    makeId: '',
    yearOfManu: '',
    fuelType: '',
    vehicleType: '',
  });

  const [images, setImages] = useState<Record<string, { uri: string; type: string; name: string } | null>>({
    MAIN: null,
    FRONT: null,
    BACK: null,
    LEFT: null,
    RIGHT: null,
    DASHBOARD: null,
    BACKSEATS: null,
  });

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));

    if (key === 'makeId') {
      const filtered = models.filter(model => model.id.toString() === value);
      setFilteredModels(filtered);
      setForm(prev => ({ ...prev, modelId: '' })); 
    }
  };


  useEffect(() => {
    const fetchMakesAndModels = async () => {
      try {
        const makesRes = await axios.get('http://172.20.10.3:8080/api/vehicles/makes');
        const modelsRes = await axios.get('http://172.20.10.3:8080/api/vehicles/models');

        if (makesRes.data.status && modelsRes.data.status) {
          setMakes(makesRes.data.data);
          setModels(modelsRes.data.data);
        }
      } catch (error) {
        console.error('Fetch error:', error);
        Alert.alert('Error', 'Failed to load makes or models.');
      }
    };

    fetchMakesAndModels();
  }, []);



  const pickImage = async (tag: string, fromCamera = false) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera or gallery access is required.');
      return;
    }

    const result = await (fromCamera
      ? ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images })
      : ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images }));

    if (!result.canceled && result.assets.length > 0) {
      const selected = result.assets[0];
      setImages(prev => ({
        ...prev,
        [tag]: {
          uri: selected.uri,
          type: selected.type || 'image/jpeg',
          name: selected.fileName || `${tag}.jpg`,
        },
      }));
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });

    for (const tag of tags) {
      const img = images[tag];
      if (img) {
        formData.append('tags', tag);
        formData.append('images', {
          uri: img.uri,
          name: img.name || `${tag}.jpg`,
          type: img.type || 'image/jpeg',
        } as any);
      }
    }

    try {
      console.log(formToJSON(formData))
      const response = await axios.post('http://172.20.10.3:8080/api/vehicles/save', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 10000,
      });

      if (response.status === 200 || response.status === 201) {
        Alert.alert('Success', 'Vehicle uploaded!');
      } else {
        Alert.alert('Error', `Upload failed: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Upload Error:', error);
      Alert.alert('Error', 'Something went wrong during upload.');
    }
  };

  const renderFormScreen = () => (
<ScrollView contentContainerStyle={{ padding: 20, marginBottom: 50, marginTop: 50 }}>
  <Text style={{ fontSize: 18, marginBottom: 10 }}>Enter Vehicle Details</Text>

  <Text>Registration Number:</Text>
  <TextInput
    placeholder="Enter Registration Number"
    value={form.regNo}
    onChangeText={text => handleChange('regNo', text)}
    style={{ borderWidth: 1, marginVertical: 5, padding: 10 }}
  />


  <Text>Make:</Text>
  <Picker
    selectedValue={form.makeId}
    onValueChange={value => handleChange('makeId', value)}
    style={{ borderWidth: 1, marginVertical: 5 }}
  >
    <Picker.Item label="Select Make" value="" />
    {makes.map(make => (
      <Picker.Item key={make.id} label={make.name} value={make.id.toString()} />
    ))}
  </Picker>

  <Text>Model:</Text>
  <Picker
    selectedValue={form.modelId}
    onValueChange={value => handleChange('modelId', value)}
    style={{ borderWidth: 1, marginVertical: 5 }}
  >
    <Picker.Item label="Select Model" value="" />
    {filteredModels.map(model => (
      <Picker.Item key={model.name} label={model.name} value={model.id} />
    ))}
  </Picker>

  <Text>Year of Manufacture:</Text>
  <TextInput
    placeholder="Enter Year of Manufacture"
    value={form.yearOfManu}
    onChangeText={text => handleChange('yearOfManu', text)}
    style={{ borderWidth: 1, marginVertical: 5, padding: 10 }}
    keyboardType="numeric"
  />

  <Text>Fuel Type:</Text>
  <Picker
    selectedValue={form.fuelType}
    onValueChange={value => handleChange('fuelType', value)}
    style={{ borderWidth: 1, marginVertical: 5 }}
  >
    <Picker.Item label="Select Fuel Type" value="" />
    <Picker.Item label="Petrol" value="PETROL" />
    <Picker.Item label="Diesel" value="DIESEL" />
    <Picker.Item label="Electric" value="ELECTRIC" />
    <Picker.Item label="Hybrid" value="HYBRID" />
  </Picker>

  <Text>Vehicle Type:</Text>
  <Picker
    selectedValue={form.vehicleType}
    onValueChange={value => handleChange('vehicleType', value)}
    style={{ borderWidth: 1, marginVertical: 5 }}
  >
    <Picker.Item label="Select Vehicle Type" value="" />
    <Picker.Item label="CAR" value="CAR" />
    <Picker.Item label="BIKE" value="BIKE" />
    <Picker.Item label="VAN" value="VAN" />
    <Picker.Item label="SUV" value="SUV" />
  </Picker>

  <Button title="Next" onPress={() => setStep(1)} />
</ScrollView>

  );

  const renderImageScreen = (tag: string) => (
    <View style={{ padding: 20, marginBottom: 50, marginTop: 50 }}>
      <Text>Select or Capture {tag} Image</Text>
      <Button title={`Pick ${tag} Image from Gallery`} onPress={() => pickImage(tag, false)} />
      <View style={{ marginVertical: 5 }} />
      <Button title={`Capture ${tag} Image with Camera`} onPress={() => pickImage(tag, true)} />
      {images[tag] && (
        <Image
          source={{ uri: images[tag]?.uri }}
          style={{ width: 250, height: 200, marginVertical: 10 }}
        />
      )}
      <Button title="Next" onPress={() => setStep(step + 1)} />
    </View>
  );

  const renderReviewScreen = () => (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 110 }}>
      <Text style={{ fontWeight: 'bold' }}>Review Vehicle Details</Text>
      {Object.entries(form).map(([key, value]) => (
        <Text key={key}>{key}: {value}</Text>
      ))}
      {tags.map(tag => (
        <View key={tag} style={{ marginTop: 10 }}>
          <Text>{tag} Image:</Text>
          {images[tag] && (
            <Image source={{ uri: images[tag]!.uri }} style={{ width: 200, height: 150 }} />
          )}
        </View>
      ))}
      <Button title="Confirm & Upload" onPress={handleSubmit} />
    </ScrollView>
  );

  if (step === 0) return renderFormScreen();
  if (step >= 1 && step <= tags.length) return renderImageScreen(tags[step - 1]);
  if (step === tags.length + 1) return renderReviewScreen();

  return null;
};

export default VehicleUploader;
