import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, FlatList, StyleSheet, Alert, ScrollView } from 'react-native';
import { launchImageLibrary, Asset  } from 'react-native-image-picker';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker'; 
import { PermissionsAndroid, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImagePickerAsset } from 'expo-image-picker';

interface Make {
  id: number;
  name: string;
  logoPath: string;
}

interface Model {
  id: number;
  name: string;
  vehicleType: string;
}

const SaveVehicle = () => {
  const [makeName, setMakeName] = useState('');
  const [logo, setLogo] = useState<ImagePickerAsset | null>(null);
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<Model[]>([]);

  const [modelName, setModelName] = useState('');
  const [selectedMakeId, setSelectedMakeId] = useState<number | null>(null);
  const [vehicleType, setVehicleType] = useState('CAR'); 
  
  const [expandedMakeIds, setExpandedMakeIds] = useState<number[]>([]);


  useEffect(() => {
    fetchMakes();
    fetchModels();
  }, []);

  const toggleExpand = (makeId: number) => {
  setExpandedMakeIds(prev =>
    prev.includes(makeId)
      ? prev.filter(id => id !== makeId)
      : [...prev, makeId]
    );
  };

  const requestGalleryPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          {
            title: 'Permission Required',
            message: 'App needs access to your gallery to upload logo',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };


  const fetchMakes = async () => {
      try {
        const response = await axios.get('http://172.236.136.110:8080/api/vehicles/makes');
        if (response.data.status) {
          setMakes(response.data.data);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch makes');
      }
    };

  const selectLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setLogo(result.assets[0]);
    }
  };

  const fetchModels = async () => {
    try {
      const response = await axios.get('http://172.236.136.110:8080/api/vehicles/models');
      if (response.data.status) {
        const formattedModels = response.data.data.map((model: any) => ({
          id: model.id,
          name: model.name,
          vehicleType: model.vehicleType,
        }));
        setModels(formattedModels);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch models');
    }
  };

const handleSaveModel = async () => {
    if (!modelName || !selectedMakeId || !vehicleType) {
      Alert.alert('Validation', 'Please fill all fields to add a model');
      return;
    }

    const data = {
      name: modelName,
      vehicleType,
      makeId: selectedMakeId,
    };

    try {
      const response = await axios.post(
        'http://172.236.136.110:8080/api/vehicles/models',
        data,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data.status) {
        Alert.alert('Success', response.data.message);
        setModelName('');
        setSelectedMakeId(null);
        setVehicleType('CAR');
        fetchModels();
      } else {
        Alert.alert('Error', response.data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save model');
    }
  };

  const handleSaveMake = async () => {
    if (!makeName || !logo) {
      Alert.alert('Validation', 'Please enter name and select logo');
      return;
    }

    const formData = new FormData();

    formData.append('name', makeName);

    if (logo) {
      formData.append('logo',  {
        uri: logo.uri,
        type: 'image/jpeg',
        name: `logo.jpg`,
      }as any);
    }

    try {
      const response = await axios.post(
        'http://172.236.136.110:8080/api/vehicles/makes',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.status) {
        Alert.alert('Success', response.data.message);
        setMakeName('');
        setLogo(null);
        fetchMakes();
      } else {
        Alert.alert('Error', response.data.message);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save make');
    }
  };



  return (
    <FlatList
      ListHeaderComponent={
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.heading}>Add Vehicle Make</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter make name"
              value={makeName}
              onChangeText={setMakeName}
            />
            <Button title="Select Logo" onPress={selectLogo} />
            {logo && (
              <Image source={{ uri: logo.uri }} style={styles.logoPreview} />
            )}
            <Button title="Save Make" onPress={handleSaveMake} />
          </View>

          <View style={styles.card}>
          <Text style={styles.heading}>Add Vehicle Model</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter model name"
            value={modelName}
            onChangeText={setModelName}
          />

          <Picker
            selectedValue={selectedMakeId}
            onValueChange={(itemValue) => setSelectedMakeId(itemValue)}
            style={styles.input}
          >
            <Picker.Item label="Select Make" value={null} />
            {makes.map(make => (
              <Picker.Item key={make.id} label={make.name} value={make.id} />
            ))}
          </Picker>

          <Picker
            selectedValue={vehicleType}
            onValueChange={(itemValue) => setVehicleType(itemValue)}
            style={styles.input}
          >
            <Picker.Item label="CAR" value="CAR" />
            <Picker.Item label="SUV" value="SUV" />
            <Picker.Item label="VAN" value="VAN" />
          </Picker>

          <Button title="Save Model" onPress={handleSaveModel} />
          </View>
        </View> 
      }

      
      contentContainerStyle={{ paddingBottom: 80, paddingHorizontal: 20 }}
      data={makes}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => {
        const isExpanded = expandedMakeIds.includes(item.id);
        const relatedModels = models.filter(model => model.id === item.id); 
        return (
          <View style={[styles.makeItem, styles.card]}>
            <View style={styles.makeRow}>
              <Image source={{ uri: item.logoPath }} style={styles.makeLogo} />
              <View style={{ flex: 1 }}>
                <Text style={styles.makeName}>{item.name}</Text>
              </View>
              <Button
                title={isExpanded ? "Hide" : "Show Models"}
                onPress={() => toggleExpand(item.id)}
              />
            </View>

            {isExpanded && (
              <View style={{ marginLeft: 20, marginTop: 5 }}>
                {relatedModels.length > 0 ? (
                  relatedModels.map((model, idx) => (
                    <Text key={idx} style={styles.modelName}>
                      {model.name} ({model.vehicleType})
                    </Text>
                  ))
                ) : (
                  <Text style={styles.modelName}>No models</Text>
                )}
              </View>
            )}
          </View>
        );
      }}

    />

  );
};

export default SaveVehicle;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 30
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
    textAlign: 'center',
  },
  heading: {
    fontSize: 20,
    marginVertical: 10
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 10
  },
  logoPreview: {
    width: 100,
    height: 100,
    marginVertical: 10
  },
  pathText: {
    fontSize: 10,
    color: 'gray'
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
  makeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingBottom: 10,
  },
  makeLogo: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 5,
  },
  makeName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modelName: {
  fontSize: 14,
  color: '#444',
  marginLeft: 10,
},
  makeItem: {
    marginVertical: 10,

    paddingBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    padding: 10
  },




});
