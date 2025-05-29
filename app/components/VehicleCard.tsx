import { View, Text, Image, TouchableOpacity } from 'react-native';

export default function VehicleCard({ vehicle, onPress }: any) {

  const mainImage = vehicle.vehicleImages.find((img: any) => img.tag === "MAIN") || vehicle.vehicleImages[0];

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 mb-4 shadow-md"
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: mainImage?.imageUrl }}
        className="w-full h-40 rounded-xl mb-3"
        resizeMode="cover"
      />

      <Text className="text-lg font-bold text-gray-800">{vehicle.regNo}</Text>
      <Text className="text-sm text-gray-600">{vehicle.make.name} - {vehicle.model.name}</Text>
      <Text className="text-sm text-gray-600">Year of Manufactured: {vehicle.yearOfManu}</Text>
      <Text className="text-sm text-gray-600">Fuel: {vehicle.fuelType}</Text>
      <Text className="text-sm text-gray-600">Type: {vehicle.vehicleType}</Text>
    </TouchableOpacity>
  );
}
