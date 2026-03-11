export interface VehicleData {
    registration?: string;
    passengerCapacity?: string;
    tonnage?: string;
    yearOfManufacture?: string;
    make?: string;
    model?: string;
    vehicleValue?: string;
}

export interface SelectedRider {
    riderId: string;
    value?: string;
}

export const buildPremiumPayload = (
    productId: string,
    vehicleData: VehicleData,
    selectedRiders: SelectedRider[]
) => {
    return {
        productId,
        vehicleData: {
            ...vehicleData,
            vehicleValue: undefined, // ensure it's not in vehicleData if it belongs outside
        },
        riderOptions: selectedRiders.map(r => ({
            riderId: r.riderId,
            value: r.value ? parseFloat(r.value) : undefined,
        })),
        vehicleValue: vehicleData.vehicleValue ? parseFloat(vehicleData.vehicleValue) : undefined,
    };
};

export const buildQuotePayload = (
    insurerProductId: string,
    vehicleData: VehicleData,
    selectedRiders: SelectedRider[]
) => {
    return {
        insurerProductId,
        vehicleData: {
            ...vehicleData,
            vehicleValue: undefined,
        },
        riderOptions: selectedRiders.map(r => ({
            riderId: r.riderId,
            value: r.value ? parseFloat(r.value) : undefined,
        })),
        vehicleValue: vehicleData.vehicleValue ? parseFloat(vehicleData.vehicleValue) : undefined,
    };
};
