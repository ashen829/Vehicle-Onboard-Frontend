import { View, Text, TextInput, Button, ScrollView, Alert, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios, { formToJSON } from 'axios';

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
        const response = await axios.get(`http://172.20.10.3:8080/api/vehicles/vehicles/${id}`);
        const vehicle = response.data.data;

        setRegNo(vehicle.regNo || '');
        setMakeId(vehicle.make?.id?.toString() || '');
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
    formData.append('makeId', makeId);
    formData.append('modelId', modelId);
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
      await axios.put(`http://172.20.10.3:8080/api/vehicles/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      Alert.alert('Success', 'Vehicle updated successfully');
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

      <TextInput placeholder="Reg No" value={regNo} onChangeText={setRegNo} className="border p-2 mb-2" />
      <TextInput placeholder="Make ID" value={makeId} onChangeText={setMakeId} className="border p-2 mb-2" />
      <TextInput placeholder="Model ID" value={modelId} onChangeText={setModelId} className="border p-2 mb-2" />
      <TextInput placeholder="Year of Manufacture" value={yearOfManu} onChangeText={setYearOfManu} keyboardType="numeric" className="border p-2 mb-2" />
      <TextInput placeholder="Fuel Type" value={fuelType} onChangeText={setFuelType} className="border p-2 mb-2" />
      <TextInput placeholder="Vehicle Type" value={vehicleType} onChangeText={setVehicleType} className="border p-2 mb-2" />

        <Text className="font-semibold my-2">Add / Replace Images</Text>
        {['MAIN', 'FRONT', 'BACK', 'LEFT', 'RIGHT', 'DASHBOARD', 'BACKSEATS'].map(tag => {
        const existingImg = existingImages.find(img => img.tag === tag);
        const newPickedImg = taggedImages.find(img => img.tag === tag);

        return (
            <View key={tag} className="mb-4">
            <Text className="font-semibold">{tag}</Text>

            {newPickedImg ? (
                <Image source={{ uri: newPickedImg.uri }} style={{ width: 100, height: 100, borderRadius: 10, marginBottom: 8 }} />
            ) : existingImg ? (
                <Image source={{ uri: existingImg.uri }} style={{ width: 100, height: 100, borderRadius: 10, marginBottom: 8 }} />
            ) : (
                <Text style={{ marginBottom: 8, color: '#999' }}>No image selected</Text>
            )}

            <Button title={`Pick ${tag} Image`} onPress={() => handlePickImage(tag)} />
            </View>
        );
        })}



      <View className="mt-6">
        <Button title="Update Vehicle" onPress={handleUpdate} />
      </View>
    </ScrollView>
  );
}
