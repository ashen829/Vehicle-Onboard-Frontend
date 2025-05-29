import { View, Text, TextInput, Button, ScrollView, Alert, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios, { formToJSON } from 'axios';
import { Ionicons } from '@expo/vector-icons';

export default function VehicleUpdatePage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [regNo, setRegNo] = useState('');
  const [makeId, setMakeId] = useState('');
  const [modelId, setModelId] = useState('');
  const [yearOfManu, setYearOfManu] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [taggedImages, setTaggedImages] = useState<{ tag: string, uri: string }[]>([]);

    const [existingImages, setExistingImages] = useState<{ tag: string, uri: string }[]>([]);

    useEffect(() => {
    const fetchVehicleDetails = async () => {
        try {
        const response = await axios.get(`http://172.236.136.110:8080/api/vehicles/vehicles/${id}`);
        const vehicle = response.data.data;

        setRegNo(vehicle.regNo || '');
        setMakeId(vehicle.make?.name || '');
        setModelId(vehicle.model?.name || '');
        setYearOfManu(vehicle.yearOfManu?.toString() || '');
        setFuelType(vehicle.fuelType || '');
        setVehicleType(vehicle.vehicleType || '');


        const imgs = vehicle.vehicleImages.map((img: any) => ({
            tag: img.tag,  
            uri: img.url || img.imageUrl || img.path, 
        }));
        setExistingImages(imgs);
        } catch (error) {
        console.error('Error fetching vehicle details:', error);
        Alert.alert('Error', 'Could not load vehicle details.');
        } finally {
        setLoading(false);
        }
    };

    fetchVehicleDetails();
    }, [id]);



  const handlePickImage = async (tag: string) => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.canceled) {
      setTaggedImages(prev => [...prev, { tag, uri: result.assets[0].uri }]);
    }
  };

  const handleUpdate = async () => {
    const formData = new FormData();

    formData.append('regNo', regNo);
    formData.append('makeId', '5');
    formData.append('modelId', '5');
    formData.append('yearOfManu', yearOfManu);
    formData.append('fuelType', fuelType);
    formData.append('vehicleType', vehicleType);

    taggedImages.forEach(({ tag, uri }) => {
      formData.append('tags', tag);
      formData.append('images', {
        uri : uri,
        type: 'image/jpeg',
        name: `${tag}.jpg`,
      } as any);
    });

    try {
    console.log(formToJSON(formData))
    const response = await fetch( `http://172.236.136.110:8080/api/vehicles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      Alert.alert('Success', 'Vehicle Updated!');
    } else {
      Alert.alert('Error', `Upload failed: ${response.status}`);
      console.error('Server response:', data);
    }
      router.back();
    } catch (err) {
      console.error('Update error:', err);
      Alert.alert('Error', 'Failed to update vehicle');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
        <Text>Loading vehicle...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="p-5 bg-white" contentContainerStyle={{ paddingBottom: 50 }}>
      <Text className="text-lg font-bold mb-2">Update Vehicle</Text>

      <View className="mb-4">
        <Text className="mb-1 text-gray-700 font-medium">Registration Number</Text>
        <TextInput
          placeholder="Reg No"
          value={regNo}
          onChangeText={setRegNo}
          className="border border-gray-300 p-2 rounded"
        />
      </View>

      <View className="mb-4">
        <Text className="mb-1 text-gray-700 font-medium">Make ID</Text>
        <TextInput
          placeholder="Make ID"
          value={makeId}
          onChangeText={setMakeId}
          className="border border-gray-300 p-2 rounded"
        />
      </View>

      <View className="mb-4">
        <Text className="mb-1 text-gray-700 font-medium">Model ID</Text>
        <TextInput
          placeholder="Model ID"
          value={modelId}
          onChangeText={setModelId}
          className="border border-gray-300 p-2 rounded"
        />
      </View>

      <View className="mb-4">
        <Text className="mb-1 text-gray-700 font-medium">Year of Manufacture</Text>
        <TextInput
          placeholder="Year of Manufacture"
          value={yearOfManu}
          onChangeText={setYearOfManu}
          keyboardType="numeric"
          className="border border-gray-300 p-2 rounded"
        />
      </View>

      <View className="mb-4">
        <Text className="mb-1 text-gray-700 font-medium">Fuel Type</Text>
        <TextInput
          placeholder="Fuel Type"
          value={fuelType}
          onChangeText={setFuelType}
          className="border border-gray-300 p-2 rounded"
        />
      </View>

      <View className="mb-4">
        <Text className="mb-1 text-gray-700 font-medium">Vehicle Type</Text>
        <TextInput
          placeholder="Vehicle Type"
          value={vehicleType}
          onChangeText={setVehicleType}
          className="border border-gray-300 p-2 rounded"
        />
      </View>


        <Text className="font-semibold my-2">Add / Replace Images</Text>
        {['MAIN', 'FRONT', 'BACK', 'LEFT', 'RIGHT', 'DASHBOARD', 'BACKSEATS'].map(tag => {
        const existingImg = existingImages.find(img => img.tag === tag);
        const newPickedImg = taggedImages.find(img => img.tag === tag);

        return (
          <View key={tag} className="mb-6">
            <Text className="font-semibold mb-2">{tag}</Text>

            {newPickedImg || existingImg ? (
              <Image
                source={{ uri: newPickedImg?.uri || existingImg?.uri }}
                style={{
                  width: '100%',
                  height: 200,
                  borderRadius: 10,
                  marginBottom: 8,
                  resizeMode: 'cover',
                }}
              />
            ) : (
              <Text style={{ marginBottom: 8, color: '#999' }}>No image selected</Text>
            )}

            <Button title={`Pick ${tag} Image`} onPress={() => handlePickImage(tag)} />
          </View>
        );
        })}

          <TouchableOpacity
            onPress={handleUpdate}
            className="bg-green-600 py-3 mt-2 rounded-xl flex-row items-center justify-center"
          >
            <Ionicons name="create-outline" size={20} color="white" />
            <Text className="text-white font-semibold text-base ml-2">Update Vehicle</Text>
          </TouchableOpacity>
    </ScrollView>
  );
}
