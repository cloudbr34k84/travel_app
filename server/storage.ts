import { 
  destinations, type Destination, type InsertDestination,
  activities, type Activity, type InsertActivity,
  accommodations, type Accommodation, type InsertAccommodation,
  trips, type Trip, type InsertTrip,
  tripDestinations, type TripDestination, type InsertTripDestination
} from "@shared/schema";

// Define the storage interface
export interface IStorage {
  // Destinations
  getDestinations(): Promise<Destination[]>;
  getDestination(id: number): Promise<Destination | undefined>;
  createDestination(destination: InsertDestination): Promise<Destination>;
  updateDestination(id: number, destination: Partial<InsertDestination>): Promise<Destination | undefined>;
  deleteDestination(id: number): Promise<boolean>;
  
  // Activities
  getActivities(): Promise<Activity[]>;
  getActivity(id: number): Promise<Activity | undefined>;
  getActivitiesByDestination(destinationId: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  updateActivity(id: number, activity: Partial<InsertActivity>): Promise<Activity | undefined>;
  deleteActivity(id: number): Promise<boolean>;
  
  // Accommodations
  getAccommodations(): Promise<Accommodation[]>;
  getAccommodation(id: number): Promise<Accommodation | undefined>;
  getAccommodationsByDestination(destinationId: number): Promise<Accommodation[]>;
  createAccommodation(accommodation: InsertAccommodation): Promise<Accommodation>;
  updateAccommodation(id: number, accommodation: Partial<InsertAccommodation>): Promise<Accommodation | undefined>;
  deleteAccommodation(id: number): Promise<boolean>;
  
  // Trips
  getTrips(): Promise<Trip[]>;
  getTrip(id: number): Promise<Trip | undefined>;
  createTrip(trip: InsertTrip): Promise<Trip>;
  updateTrip(id: number, trip: Partial<InsertTrip>): Promise<Trip | undefined>;
  deleteTrip(id: number): Promise<boolean>;
  
  // Trip Destinations
  getTripDestinations(tripId: number): Promise<TripDestination[]>;
  addDestinationToTrip(tripDestination: InsertTripDestination): Promise<TripDestination>;
  removeDestinationFromTrip(tripId: number, destinationId: number): Promise<boolean>;
  
  // Stats
  getDashboardStats(): Promise<{
    upcomingTripsCount: number;
    destinationsCount: number;
    activitiesCount: number;
    accommodationsCount: number;
  }>;
}

export class MemStorage implements IStorage {
  private destinations: Map<number, Destination>;
  private activities: Map<number, Activity>;
  private accommodations: Map<number, Accommodation>;
  private trips: Map<number, Trip>;
  private tripDestinations: Map<number, TripDestination>;
  
  private destinationId: number;
  private activityId: number;
  private accommodationId: number;
  private tripId: number;
  private tripDestinationId: number;
  
  constructor() {
    this.destinations = new Map();
    this.activities = new Map();
    this.accommodations = new Map();
    this.trips = new Map();
    this.tripDestinations = new Map();
    
    this.destinationId = 1;
    this.activityId = 1;
    this.accommodationId = 1;
    this.tripId = 1;
    this.tripDestinationId = 1;
    
    // Initialize with some sample data
    this.initSampleData();
  }
  
  private initSampleData() {
    // Sample destinations
    const sampleDestinations: InsertDestination[] = [
      { name: "Paris", country: "France", region: "Europe", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34", status: "visited" },
      { name: "Tokyo", country: "Japan", region: "Asia", image: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc", status: "planned" },
      { name: "Sydney", country: "Australia", region: "Oceania", image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9", status: "wishlist" },
      { name: "Venice", country: "Italy", region: "Europe", image: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9", status: "visited" },
      { name: "Santorini", country: "Greece", region: "Europe", image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff", status: "wishlist" },
      { name: "Machu Picchu", country: "Peru", region: "South America", image: "https://images.unsplash.com/photo-1526392060635-9d6019884377", status: "planned" },
    ];
    
    sampleDestinations.forEach(dest => this.createDestination(dest));
    
    // Sample activities
    const sampleActivities: InsertActivity[] = [
      { name: "Eiffel Tower Visit", description: "Visit the iconic Eiffel Tower", category: "Sightseeing", destinationId: 1, image: "https://images.unsplash.com/photo-1543349689-9a4d426bee8e" },
      { name: "Louvre Museum", description: "Explore art at the Louvre", category: "Culture", destinationId: 1, image: "https://images.unsplash.com/photo-1565783795132-13a333cdcd75" },
      { name: "Tokyo Skytree", description: "Visit one of the tallest towers in the world", category: "Sightseeing", destinationId: 2, image: "https://images.unsplash.com/photo-1536984456083-d957495fb197" },
      { name: "Sydney Opera House Tour", description: "Tour the famous Sydney Opera House", category: "Culture", destinationId: 3, image: "https://images.unsplash.com/photo-1510162548618-d50a4c4c8d18" },
    ];
    
    sampleActivities.forEach(activity => this.createActivity(activity));
    
    // Sample accommodations
    const sampleAccommodations: InsertAccommodation[] = [
      { name: "Hotel de Paris", type: "Hotel", destinationId: 1, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945" },
      { name: "Tokyo Bay Resort", type: "Resort", destinationId: 2, image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4" },
      { name: "Sydney Harbor View", type: "Apartment", destinationId: 3, image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267" },
      { name: "Venice Canal House", type: "Guesthouse", destinationId: 4, image: "https://images.unsplash.com/photo-1516455590571-18256e5bb9ff" },
    ];
    
    sampleAccommodations.forEach(accommodation => this.createAccommodation(accommodation));
    
    // Sample trips
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);
    
    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);
    
    const twoMonthsAgo = new Date(today);
    twoMonthsAgo.setMonth(today.getMonth() - 2);
    
    const sampleTrips: InsertTrip[] = [
      { name: "Japan Adventure", startDate: nextMonth, endDate: new Date(nextMonth.getTime() + 14 * 24 * 60 * 60 * 1000), status: "planned" },
      { name: "Bali Getaway", startDate: twoMonthsAgo, endDate: new Date(twoMonthsAgo.getTime() + 10 * 24 * 60 * 60 * 1000), status: "completed" },
      { name: "Swiss Alps Adventure", startDate: lastMonth, endDate: new Date(lastMonth.getTime() + 8 * 24 * 60 * 60 * 1000), status: "completed" },
      { name: "New York City Trip", startDate: new Date(lastMonth.getTime() - 30 * 24 * 60 * 60 * 1000), endDate: new Date(lastMonth.getTime() - 24 * 24 * 60 * 60 * 1000), status: "completed" },
    ];
    
    sampleTrips.forEach(trip => this.createTrip(trip));
    
    // Link trips to destinations
    this.addDestinationToTrip({ tripId: 1, destinationId: 2 }); // Japan Adventure -> Tokyo
    this.addDestinationToTrip({ tripId: 2, destinationId: 1 }); // Bali Getaway -> Paris (just for the example)
    this.addDestinationToTrip({ tripId: 3, destinationId: 4 }); // Swiss Alps Adventure -> Venice (just for the example)
    this.addDestinationToTrip({ tripId: 4, destinationId: 3 }); // New York City Trip -> Sydney (just for the example)
  }
  
  // Destinations
  async getDestinations(): Promise<Destination[]> {
    return Array.from(this.destinations.values());
  }
  
  async getDestination(id: number): Promise<Destination | undefined> {
    return this.destinations.get(id);
  }
  
  async createDestination(destination: InsertDestination): Promise<Destination> {
    const id = this.destinationId++;
    const newDestination: Destination = { ...destination, id };
    this.destinations.set(id, newDestination);
    return newDestination;
  }
  
  async updateDestination(id: number, destination: Partial<InsertDestination>): Promise<Destination | undefined> {
    const existingDestination = this.destinations.get(id);
    if (!existingDestination) return undefined;
    
    const updatedDestination = { ...existingDestination, ...destination };
    this.destinations.set(id, updatedDestination);
    return updatedDestination;
  }
  
  async deleteDestination(id: number): Promise<boolean> {
    return this.destinations.delete(id);
  }
  
  // Activities
  async getActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values());
  }
  
  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }
  
  async getActivitiesByDestination(destinationId: number): Promise<Activity[]> {
    return Array.from(this.activities.values()).filter(activity => activity.destinationId === destinationId);
  }
  
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.activityId++;
    const newActivity: Activity = { ...activity, id };
    this.activities.set(id, newActivity);
    return newActivity;
  }
  
  async updateActivity(id: number, activity: Partial<InsertActivity>): Promise<Activity | undefined> {
    const existingActivity = this.activities.get(id);
    if (!existingActivity) return undefined;
    
    const updatedActivity = { ...existingActivity, ...activity };
    this.activities.set(id, updatedActivity);
    return updatedActivity;
  }
  
  async deleteActivity(id: number): Promise<boolean> {
    return this.activities.delete(id);
  }
  
  // Accommodations
  async getAccommodations(): Promise<Accommodation[]> {
    return Array.from(this.accommodations.values());
  }
  
  async getAccommodation(id: number): Promise<Accommodation | undefined> {
    return this.accommodations.get(id);
  }
  
  async getAccommodationsByDestination(destinationId: number): Promise<Accommodation[]> {
    return Array.from(this.accommodations.values()).filter(accommodation => accommodation.destinationId === destinationId);
  }
  
  async createAccommodation(accommodation: InsertAccommodation): Promise<Accommodation> {
    const id = this.accommodationId++;
    const newAccommodation: Accommodation = { ...accommodation, id };
    this.accommodations.set(id, newAccommodation);
    return newAccommodation;
  }
  
  async updateAccommodation(id: number, accommodation: Partial<InsertAccommodation>): Promise<Accommodation | undefined> {
    const existingAccommodation = this.accommodations.get(id);
    if (!existingAccommodation) return undefined;
    
    const updatedAccommodation = { ...existingAccommodation, ...accommodation };
    this.accommodations.set(id, updatedAccommodation);
    return updatedAccommodation;
  }
  
  async deleteAccommodation(id: number): Promise<boolean> {
    return this.accommodations.delete(id);
  }
  
  // Trips
  async getTrips(): Promise<Trip[]> {
    return Array.from(this.trips.values());
  }
  
  async getTrip(id: number): Promise<Trip | undefined> {
    return this.trips.get(id);
  }
  
  async createTrip(trip: InsertTrip): Promise<Trip> {
    const id = this.tripId++;
    const newTrip: Trip = { ...trip, id };
    this.trips.set(id, newTrip);
    return newTrip;
  }
  
  async updateTrip(id: number, trip: Partial<InsertTrip>): Promise<Trip | undefined> {
    const existingTrip = this.trips.get(id);
    if (!existingTrip) return undefined;
    
    const updatedTrip = { ...existingTrip, ...trip };
    this.trips.set(id, updatedTrip);
    return updatedTrip;
  }
  
  async deleteTrip(id: number): Promise<boolean> {
    // Delete associated trip destinations
    Array.from(this.tripDestinations.values())
      .filter(td => td.tripId === id)
      .forEach(td => this.tripDestinations.delete(td.id));
    
    return this.trips.delete(id);
  }
  
  // Trip Destinations
  async getTripDestinations(tripId: number): Promise<TripDestination[]> {
    return Array.from(this.tripDestinations.values()).filter(td => td.tripId === tripId);
  }
  
  async addDestinationToTrip(tripDestination: InsertTripDestination): Promise<TripDestination> {
    const id = this.tripDestinationId++;
    const newTripDestination: TripDestination = { ...tripDestination, id };
    this.tripDestinations.set(id, newTripDestination);
    return newTripDestination;
  }
  
  async removeDestinationFromTrip(tripId: number, destinationId: number): Promise<boolean> {
    const tripDest = Array.from(this.tripDestinations.values()).find(
      td => td.tripId === tripId && td.destinationId === destinationId
    );
    
    if (tripDest) {
      return this.tripDestinations.delete(tripDest.id);
    }
    
    return false;
  }
  
  // Stats
  async getDashboardStats(): Promise<{
    upcomingTripsCount: number;
    destinationsCount: number;
    activitiesCount: number;
    accommodationsCount: number;
  }> {
    const today = new Date();
    
    const upcomingTrips = Array.from(this.trips.values()).filter(trip => {
      const startDate = new Date(trip.startDate);
      return startDate > today && trip.status === "planned";
    });
    
    return {
      upcomingTripsCount: upcomingTrips.length,
      destinationsCount: this.destinations.size,
      activitiesCount: this.activities.size,
      accommodationsCount: this.accommodations.size,
    };
  }
}

export const storage = new MemStorage();
