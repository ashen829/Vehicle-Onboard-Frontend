import { Image, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { images } from "@/constants/images";
import { icons } from "@/constants/icons";
import SearchBar from "../components/SearchBar";
import VehicleCard from "../components/VehicleCard";
import { useEffect, useState } from "react";
import axios from "axios";
import { Vehicle } from "../types";

export default function Index() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    axios.get("http://172.236.136.110:8080/api/vehicles/vehicles")
      .then(res => {
        if (res.status) {
          setVehicles(res.data.data);
        }
      })
      .catch(err => {
        console.error("Error fetching vehicles", err);
      });
  }, []);

  return (
    <View className="flex-1 bg-slate-200">
      <Image source={images.bg} className="absolute w-full z-0" />

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ minHeight: "100%", paddingBottom: 80 }}
      >
        <Image source={icons.logo} className="w-12 h-10 mt-20 mb-5 mx-auto" />

        <View className="flex-1 mt-5">
          <SearchBar
            onPress={() => router.push("/search")}
            placeholder='Search for a vehicle'
          />
        </View>

        <View className="mt-6">
          {(vehicles ?? []).map(vehicle => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onPress={() => router.push({ pathname: "/vehicles/[id]", params: { id: vehicle.id.toString() } })}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
