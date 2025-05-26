export type ImageTag = "MAIN" | "FRONT" | "REAR" | "SIDE"; 

export interface VehicleImage {
  id: number;
  imageUrl: string;
  tag: ImageTag;
}

export interface Make {
  name: string;
}

export interface Model {
  name: string;
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
