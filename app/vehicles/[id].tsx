import { View, Text, Image, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

export interface VehicleImage {
  id: number;
  tag: string;
  imageUrl: string;
}

export interface Make {
  id: number;
  name: string;
  logoPath: string;
}

export interface Model {
  name: string;
  make: Make;
  vehicleType: string;
}

export interface Vehicle {
  id: number;
  regNo: string;
  make: Make;
  model: Model;
  yearOfManu: number;
  fuelType: string;
  vehicleType: string;
  vehicleImages: VehicleImage[];
}

export default function VehicleDetailsPage() {
  const { id } = useLocalSearchParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    axios
      .get(`http://172.20.10.3:8080/api/vehicles/vehicles/${id}`)
      .then((res) => {
        if (res.data?.status) {
          setVehicle(res.data.data);
        }
      })
      .catch((err) => {
        console.error("Error fetching vehicle details:", err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = () => {
    Alert.alert("Confirm Deletion", "Are you sure you want to delete this vehicle?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          axios
            .delete(`http://172.20.10.3:8080/api/vehicles/${id}`)
            .then(() => {
              Alert.alert("Deleted", "Vehicle has been deleted successfully.");
              router.back();
            })
            .catch((err) => {
              console.error("Error deleting vehicle:", err);
              Alert.alert("Error", "Failed to delete vehicle.");
            });
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#1E40AF" />
        <Text className="mt-3 text-gray-600">Loading vehicle details...</Text>
      </View>
    );
  }

  if (!vehicle) {
    return (
      <View className="flex-1 justify-center items-center p-5 bg-white">
        <Text className="text-center text-red-500 text-lg">Vehicle not found</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-100 px-4 pt-6" contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="bg-white rounded-2xl shadow-md p-5">
        <Text className="text-2xl font-bold text-gray-900 mb-3">{vehicle.regNo}</Text>
        <View className="flex-row items-center mb-2">
          <Image source={{ uri: vehicle.make.logoPath }} className="w-8 h-8 mr-2" />
          <Text className="text-lg text-gray-800">{vehicle.make.name}</Text>
        </View>
<View className="space-y-3">
  <View className="border border-gray-300 rounded-lg p-3 bg-gray-50">
    <Text className="text-xs text-gray-500">Model</Text>
    <Text className="text-base text-gray-800">{vehicle.model.name}</Text>
  </View>

  <View className="border border-gray-300 rounded-lg p-3 bg-gray-50">
    <Text className="text-xs text-gray-500">Year of Manufacture</Text>
    <Text className="text-base text-gray-800">{vehicle.yearOfManu}</Text>
  </View>

  <View className="border border-gray-300 rounded-lg p-3 bg-gray-50">
    <Text className="text-xs text-gray-500">Fuel Type</Text>
    <Text className="text-base text-gray-800">{vehicle.fuelType}</Text>
  </View>

  <View className="border border-gray-300 rounded-lg p-3 bg-gray-50">
    <Text className="text-xs text-gray-500">Vehicle Type</Text>
    <Text className="text-base text-gray-800">{vehicle.vehicleType}</Text>
  </View>
</View>


        <Text className="text-lg font-semibold mt-4 mb-2 text-gray-800">Images</Text>
        {vehicle.vehicleImages.map((img, idx) => (
          <View key={idx} className="mb-4">
            <Text className="text-sm text-gray-600 mb-1">{img.tag}</Text>
            <Image
              source={{ uri: img.imageUrl }}
              className="w-full h-48 rounded-xl"
              resizeMode="cover"
            />
          </View>
        ))}

        <View className="mt-6 space-y-3">
          <TouchableOpacity
            onPress={handleDelete}
            className="bg-red-500 py-3 rounded-xl flex-row items-center justify-center"
          >
            <Ionicons name="trash-outline" size={20} color="white" />
            <Text className="text-white font-semibold text-base ml-2">Delete Vehicle</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push(`/vehicles/update/${id}`)}
            className="bg-blue-600 py-3 mt-2 rounded-xl flex-row items-center justify-center"
          >
            <Ionicons name="create-outline" size={20} color="white" />
            <Text className="text-white font-semibold text-base ml-2">Update Vehicle</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
