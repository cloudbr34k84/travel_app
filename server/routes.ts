import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertDestinationSchema, insertActivitySchema, insertAccommodationSchema, 
  insertTripSchema, insertTripDestinationSchema,
  Destination, Activity, Accommodation, Trip, TripDestination
} from "@shared/schema";
import { z } from "zod";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  // Destinations
  app.get("/api/destinations", async (req: Request, res: Response) => {
    try {
      const destinations: Destination[] = await storage.getDestinations();
      res.json(destinations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch destinations" });
    }
  });
  
  app.get("/api/destinations/:id", async (req: Request, res: Response) => {
    try {
      const id: number = parseInt(req.params.id);
      const destination: Destination | undefined = await storage.getDestination(id);
      
      if (!destination) {
        return res.status(404).json({ message: "Destination not found" });
      }
      
      res.json(destination);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch destination" });
    }
  });
  
  app.post("/api/destinations", async (req: Request, res: Response) => {
    try {
      const destinationData = insertDestinationSchema.parse(req.body);
      const newDestination: Destination = await storage.createDestination(destinationData);
      res.status(201).json(newDestination);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid destination data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create destination" });
    }
  });
  
  app.put("/api/destinations/:id", async (req: Request, res: Response) => {
    try {
      const id: number = parseInt(req.params.id);
      const destinationData = insertDestinationSchema.partial().parse(req.body);
      
      const updatedDestination: Destination | undefined = await storage.updateDestination(id, destinationData);
      
      if (!updatedDestination) {
        return res.status(404).json({ message: "Destination not found" });
      }
      
      res.json(updatedDestination);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid destination data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update destination" });
    }
  });
  
  app.delete("/api/destinations/:id", async (req: Request, res: Response) => {
    try {
      const id: number = parseInt(req.params.id);
      const success: boolean = await storage.deleteDestination(id);
      
      if (!success) {
        return res.status(404).json({ message: "Destination not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete destination" });
    }
  });
  
  // Activities
  app.get("/api/activities", async (req: Request, res: Response) => {
    try {
      const { destinationId } = req.query;
      let activities: Activity[];
      
      if (destinationId) {
        activities = await storage.getActivitiesByDestination(parseInt(destinationId as string));
      } else {
        activities = await storage.getActivities();
      }
      
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });
  
  app.get("/api/activities/:id", async (req: Request, res: Response) => {
    try {
      const id: number = parseInt(req.params.id);
      const activity: Activity | undefined = await storage.getActivity(id);
      
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });
  
  app.post("/api/activities", async (req: Request, res: Response) => {
    try {
      const activityData = insertActivitySchema.parse(req.body);
      const newActivity: Activity = await storage.createActivity(activityData);
      res.status(201).json(newActivity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid activity data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create activity" });
    }
  });
  
  app.put("/api/activities/:id", async (req: Request, res: Response) => {
    try {
      const id: number = parseInt(req.params.id);
      const activityData = insertActivitySchema.partial().parse(req.body);
      
      const updatedActivity: Activity | undefined = await storage.updateActivity(id, activityData);
      
      if (!updatedActivity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      res.json(updatedActivity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid activity data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update activity" });
    }
  });
  
  app.delete("/api/activities/:id", async (req: Request, res: Response) => {
    try {
      const id: number = parseInt(req.params.id);
      const success: boolean = await storage.deleteActivity(id);
      
      if (!success) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete activity" });
    }
  });
  
  // Accommodations
  app.get("/api/accommodations", async (req: Request, res: Response) => {
    try {
      const { destinationId } = req.query;
      let accommodations: Accommodation[];
      
      if (destinationId) {
        accommodations = await storage.getAccommodationsByDestination(parseInt(destinationId as string));
      } else {
        accommodations = await storage.getAccommodations();
      }
      
      res.json(accommodations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch accommodations" });
    }
  });
  
  app.get("/api/accommodations/:id", async (req: Request, res: Response) => {
    try {
      const id: number = parseInt(req.params.id);
      const accommodation: Accommodation | undefined = await storage.getAccommodation(id);
      
      if (!accommodation) {
        return res.status(404).json({ message: "Accommodation not found" });
      }
      
      res.json(accommodation);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch accommodation" });
    }
  });
  
  app.post("/api/accommodations", async (req: Request, res: Response) => {
    try {
      const accommodationData = insertAccommodationSchema.parse(req.body);
      const newAccommodation: Accommodation = await storage.createAccommodation(accommodationData);
      res.status(201).json(newAccommodation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid accommodation data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create accommodation" });
    }
  });
  
  app.put("/api/accommodations/:id", async (req: Request, res: Response) => {
    try {
      const id: number = parseInt(req.params.id);
      const accommodationData = insertAccommodationSchema.partial().parse(req.body);
      
      const updatedAccommodation: Accommodation | undefined = await storage.updateAccommodation(id, accommodationData);
      
      if (!updatedAccommodation) {
        return res.status(404).json({ message: "Accommodation not found" });
      }
      
      res.json(updatedAccommodation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid accommodation data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update accommodation" });
    }
  });
  
  app.delete("/api/accommodations/:id", async (req: Request, res: Response) => {
    try {
      const id: number = parseInt(req.params.id);
      const success: boolean = await storage.deleteAccommodation(id);
      
      if (!success) {
        return res.status(404).json({ message: "Accommodation not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete accommodation" });
    }
  });
  
  // Trips
  app.get("/api/trips", async (req: Request, res: Response) => {
    try {
      const trips: Trip[] = await storage.getTrips();
      res.json(trips);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trips" });
    }
  });
  
  app.get("/api/trips/:id", async (req: Request, res: Response) => {
    try {
      const id: number = parseInt(req.params.id);
      const trip: Trip | undefined = await storage.getTrip(id);
      
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }
      
      res.json(trip);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trip" });
    }
  });
  
  app.post("/api/trips", async (req: Request, res: Response) => {
    try {
      const tripData = insertTripSchema.parse(req.body);
      const newTrip: Trip = await storage.createTrip(tripData);
      res.status(201).json(newTrip);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid trip data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create trip" });
    }
  });
  
  app.put("/api/trips/:id", async (req: Request, res: Response) => {
    try {
      const id: number = parseInt(req.params.id);
      const tripData = insertTripSchema.partial().parse(req.body);
      
      const updatedTrip: Trip | undefined = await storage.updateTrip(id, tripData);
      
      if (!updatedTrip) {
        return res.status(404).json({ message: "Trip not found" });
      }
      
      res.json(updatedTrip);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid trip data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update trip" });
    }
  });
  
  app.delete("/api/trips/:id", async (req: Request, res: Response) => {
    try {
      const id: number = parseInt(req.params.id);
      const success: boolean = await storage.deleteTrip(id);
      
      if (!success) {
        return res.status(404).json({ message: "Trip not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete trip" });
    }
  });
  
  // Trip Destinations
  app.get("/api/trips/:tripId/destinations", async (req: Request, res: Response) => {
    try {
      const tripId: number = parseInt(req.params.tripId);
      const tripDestinations: TripDestination[] = await storage.getTripDestinations(tripId);
      res.json(tripDestinations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trip destinations" });
    }
  });
  
  app.post("/api/trips/:tripId/destinations", async (req: Request, res: Response) => {
    try {
      const tripId: number = parseInt(req.params.tripId);
      const destinationId: number = req.body.destinationId;
      
      const tripDestinationData = insertTripDestinationSchema.parse({
        tripId,
        destinationId,
      });
      
      const newTripDestination: TripDestination = await storage.addDestinationToTrip(tripDestinationData);
      res.status(201).json(newTripDestination);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid trip destination data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add destination to trip" });
    }
  });
  
  app.delete("/api/trips/:tripId/destinations/:destinationId", async (req: Request, res: Response) => {
    try {
      const tripId: number = parseInt(req.params.tripId);
      const destinationId: number = parseInt(req.params.destinationId);
      
      const success: boolean = await storage.removeDestinationFromTrip(tripId, destinationId);
      
      if (!success) {
        return res.status(404).json({ message: "Trip destination not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove destination from trip" });
    }
  });
  
  // Dashboard Stats
  app.get("/api/dashboard/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });
  
  /**
   * Global error handler middleware
   * 
   * @description Catches all errors that occur during request processing and formats
   * consistent JSON responses for the client.
   * 
   * @param {Error & { status?: number; statusCode?: number }} err - The error object
   * @param {Request} _req - The Express request object (unused but required)
   * @param {Response} res - The Express response object used to send the response
   * @param {NextFunction} _next - The Express next function (unused but required)
   * 
   * @returns {void}
   * 
   * @behavior
   * - Logs the error to the console for server-side debugging
   * - Uses the error's status/statusCode property if available, defaults to 500
   * - Returns a JSON response with error.message or a default message if not provided
   * - Format of response: { error: string }
   */
  app.use((err: Error & { status?: number; statusCode?: number }, _req: Request, res: Response, _next: NextFunction): void => {
    console.error(err);
    res.status(err.status || err.statusCode || 500).json({ error: err.message || 'Internal error' });
  });
  
  const httpServer = createServer(app);
  
  return httpServer;
}
