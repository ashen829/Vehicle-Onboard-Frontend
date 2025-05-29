import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, Alert, StyleSheet, TouchableOpacity, Dimensions, Image, Pressable } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';


const tags = ['MAIN', 'FRONT', 'BACK', 'LEFT', 'RIGHT', 'DASHBOARD', 'BACKSEATS'] as const;
type Tag = typeof tags[number];
const { width } = Dimensions.get('window');

interface Make {
  id: string;
  name: string;
}

interface Model {
  id: string;
  name: string;
  VehicleType?: string;
}

interface FormState {
  regNo: string;
  modelId: string;
  makeId: string;
  yearOfManu: string;
  fuelType: string;
  vehicleType: string;
}

interface ImageData {
  uri: string;
  type: string;
  name: string;
}

type ImageState = Record<Tag, ImageData | null>;

interface ErrorsState {
  regNo?: string;
  makeId?: string;
  modelId?: string;
  yearOfManu?: string;
  fuelType?: string;
  vehicleType?: string;
  [key: string]: string | undefined;
}

// Map tags to sample images in assets folder
const sampleImages: Record<Tag, any> = {
  MAIN: require('../../assets/images/MAIN.jpg'),
  FRONT: require('../../assets/images/FRONT.jpg'),
  BACK: require('../../assets/images/LEFT.jpg'),
  LEFT: require('../../assets/images/RIGHT.jpg'),
  RIGHT: require('../../assets/images/DASHBOARD.jpg'),
  DASHBOARD: require('../../assets/images/BACK.jpg'),
  BACKSEATS: require('../../assets/images/BACKSEATS.jpg'),
};

const handleOnboard = () => {
  router.push('/(tabs)/saveVehicle');
};

const VehicleUploader: React.FC = () => {
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [step, setStep] = useState<number>(0);
  const [form, setForm] = useState<FormState>({
    regNo: '',
    modelId: '',
    makeId: '',
    yearOfManu: '',
    fuelType: '',
    vehicleType: '',
  });
  const [images, setImages] = useState<ImageState>({
    MAIN: null,
    FRONT: null,
    BACK: null,
    LEFT: null,
    RIGHT: null,
    DASHBOARD: null,
    BACKSEATS: null,
  });
  const [errors, setErrors] = useState<ErrorsState>({});

  const handleChange = (key: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));

    if (key === 'makeId') {
      console.log('Selected makeId:', value);
      console.log('Available models:', JSON.stringify(models, null, 2));
      const filtered = models.filter(model => {
        const modelMakeId = model.id ?? model.id;
        if (!modelMakeId) {
          console.warn(`Model ${model.name} (id: ${model.id}) has no makeId or make_id`);
          return false;
        }
        const matches = modelMakeId.toString() === value.toString();
        console.log(`Model ${model.name} (makeId/make_id: ${modelMakeId}) matches ${value}: ${matches}`);
        return matches;
      });
      console.log('Filtered models:', JSON.stringify(filtered, null, 2));
      setFilteredModels(filtered);
      setForm(prev => ({ ...prev, modelId: '' }));
      if (filtered.length === 0) {
        setErrors(prev => ({ ...prev, modelId: 'No models available for this make. Please select another make or try again.' }));
      }
    }
  };

  useEffect(() => {
    const fetchMakesAndModels = async () => {
      try {
        const makesRes = await axios.get<{ status: boolean; data: Make[] }>('http://172.236.136.110:8080/api/vehicles/makes');
        const modelsRes = await axios.get<{ status: boolean; data: Model[] }>('http://172.236.136.110:8080/api/vehicles/models');

        if (makesRes.data.status && modelsRes.data.status) {
          console.log('Fetched makes:', JSON.stringify(makesRes.data.data, null, 2));
          console.log('Fetched models:', JSON.stringify(modelsRes.data.data, null, 2));
          setMakes(makesRes.data.data);
          setModels(modelsRes.data.data);
          setFilteredModels([]);
        }
      } catch (error) {
        console.error('Fetch error:', error);
        Alert.alert('Error', 'Failed to load makes or models.');
      }
    };

    fetchMakesAndModels();
  }, []);

  const pickImage = async (tag: Tag, fromCamera = false) => {
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
      setErrors(prev => ({ ...prev, [tag]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ErrorsState = {};
    if (!form.regNo.trim()) newErrors.regNo = 'Registration Number is required';
    if (!form.makeId) newErrors.makeId = 'Make is required';
    if (!form.modelId) newErrors.modelId = 'Model is required';
    if (!form.yearOfManu.trim()) newErrors.yearOfManu = 'Year of Manufacture is required';
    if (!form.fuelType) newErrors.fuelType = 'Fuel Type is required';
    if (!form.vehicleType) newErrors.vehicleType = 'Vehicle Type is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateImage = (tag: Tag): boolean => {
    if (!images[tag]) {
      setErrors(prev => ({ ...prev, [tag]: `${tag} image is required` }));
      return false;
    }
    return true;
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
          type: 'image/jpeg',
          name: `${tag}.jpg`,
        } as any);
      }
    }

    try {
      const response = await fetch('http://172.236.136.110:8080/api/vehicles/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Vehicle uploaded!');
        setForm({
          regNo: '',
          modelId: '',
          makeId: '',
          yearOfManu: '',
          fuelType: '',
          vehicleType: '',
        });
        setImages({
          MAIN: null,
          FRONT: null,
          BACK: null,
          LEFT: null,
          RIGHT: null,
          DASHBOARD: null,
          BACKSEATS: null,
        });
        setErrors({});
        setFilteredModels([]);
        setStep(0);
      } else {
        Alert.alert('Error', `Upload failed: ${response.status}`);
        console.error('Server response:', data);
      }
    } catch (error) {
      console.error('Upload Error:', error);
      Alert.alert('Error', 'Something went wrong during upload.');
    }
  };

  const renderFormScreen = () => (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>Enter Vehicle Details</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Registration Number</Text>
        <TextInput
          placeholder="Enter Registration Number"
          value={form.regNo}
          onChangeText={text => handleChange('regNo', text)}
          style={styles.input}
        />
        {errors.regNo && <Text style={styles.error}>{errors.regNo}</Text>}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Make</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.makeId}
            onValueChange={value => handleChange('makeId', value)}
            style={styles.picker}
          >
            <Picker.Item label="Select Make" value="" />
            {makes.map(make => (
              <Picker.Item key={make.id} label={make.name} value={make.id} />
            ))}
          </Picker>
        </View>
        {errors.makeId && <Text style={styles.error}>{errors.makeId}</Text>}

        <Text style={styles.label}>Model</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.modelId}
            onValueChange={value => handleChange('modelId', value)}
            style={styles.picker}
            enabled={filteredModels.length > 0}
          >
            <Picker.Item label={filteredModels.length > 0 ? "Select Model" : "No Models Available"} value="" />
            {filteredModels.map(model => (
              <Picker.Item key={model.id} label={model.name} value={model.id} />
            ))}
          </Picker>
        </View>
        {errors.modelId && <Text style={styles.error}>{errors.modelId}</Text>}
      </View>

      <Pressable style={[styles.button, styles.secondaryButton]} onPress={handleOnboard}>
        <Text style={styles.buttonText}>Add Make/Model</Text>
      </Pressable>

      <View style={styles.card}>
        <Text style={styles.label}>Fuel Type</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.fuelType}
            onValueChange={value => handleChange('fuelType', value)}
            style={styles.picker}
          >
            <Picker.Item label="Select Fuel Type" value="" />
            <Picker.Item label="Petrol" value="PETROL" />
            <Picker.Item label="Diesel" value="DIESEL" />
            <Picker.Item label="Electric" value="ELECTRIC" />
            <Picker.Item label="Hybrid" value="HYBRID" />
          </Picker>
        </View>
        {errors.fuelType && <Text style={styles.error}>{errors.fuelType}</Text>}

        <Text style={styles.label}>Vehicle Type</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.vehicleType}
            onValueChange={value => handleChange('vehicleType', value)}
            style={styles.picker}
          >
            <Picker.Item label="Select Vehicle Type" value="" />
            <Picker.Item label="CAR" value="CAR" />
            <Picker.Item label="BIKE" value="BIKE" />
            <Picker.Item label="VAN" value="VAN" />
            <Picker.Item label="SUV" value="SUV" />
          </Picker>
        </View>
        {errors.vehicleType && <Text style={styles.error}>{errors.vehicleType}</Text>}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Year of Manufacture</Text>
        <TextInput
          placeholder="Enter Year of Manufacture"
          value={form.yearOfManu}
          onChangeText={text => handleChange('yearOfManu', text)}
          style={styles.input}
          keyboardType="numeric"
        />
        {errors.yearOfManu && <Text style={styles.error}>{errors.yearOfManu}</Text>}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          if (validateForm()) setStep(1);
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderImageScreen = (tag: Tag) => (
    <View style={styles.imageContainer}>
      <Text style={styles.subtitle}>Select or Capture {tag} Image</Text>
      <Image
        source={sampleImages[tag] || { uri: 'https://via.placeholder.com/300x200?text=Sample+Image+Not+Found' }}
        style={styles.sampleImage}
        onError={() => console.warn(`Failed to load sample image for ${tag}`)}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => pickImage(tag, false)}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>Pick {tag} Image from Gallery</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => pickImage(tag, true)}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>Capture {tag} Image with Camera</Text>
      </TouchableOpacity>
      {images[tag] && (
        <Image
          source={{ uri: images[tag]?.uri }}
          style={styles.uploadedImage}
        />
      )}
      {errors[tag] && <Text style={styles.error}>{errors[tag]}</Text>}
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          if (validateImage(tag)) setStep(step + 1);
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );

  const renderReviewScreen = () => (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.subtitle}>Review Vehicle Details</Text>
      {Object.entries(form).map(([key, value]) => (
        <View key={key} style={styles.formField}>
          <Text style={styles.label}>{key.replace(/([A-Z])/g, ' $1').trim()}</Text>
          <View style={styles.formInput}>
            <Text style={styles.formText}>{value || 'N/A'}</Text>
          </View>
        </View>
      ))}
      {tags.map(tag => (
        <View key={tag} style={styles.imageReviewContainer}>
          <Text style={styles.label}>{tag} Image</Text>
          {images[tag] && (
            <Image source={{ uri: images[tag]!.uri }} style={styles.uploadedImage} />
          )}
        </View>
      ))}
      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        activeOpacity={0.7}
      >
        <Ionicons name="cloud-upload-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>Confirm & Upload</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  if (step === 0) return renderFormScreen();
  if (step >= 1 && step <= tags.length) return renderImageScreen(tags[step - 1]);
  if (step === tags.length + 1) return renderReviewScreen();

  return null;
};

const styles = StyleSheet.create({
  scrollContainer: {
    marginTop : 40,
    padding: 20,
    paddingBottom: 120,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    color: '#444',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
    secondaryButton: {
    backgroundColor: '#10b981',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  error: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  sampleImage: {
    width: 300,
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  uploadedImage: {
    width: width - 40,
    height: 250,
    borderRadius: 10,
    marginVertical: 10,
  },
  formField: {
    marginBottom: 15,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  formText: {
    fontSize: 16,
    color: '#333',
  },
  imageReviewContainer: {
    marginBottom: 15,
  },
});

export default VehicleUploader;
