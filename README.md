
# Wanderlust - Travel Planning Application

A full-stack TypeScript application for planning and managing your travel destinations, trips, activities, and accommodations.

## Project Overview

Wanderlust is a comprehensive travel planning platform that helps users:
- Organize destinations by wishlist, planned, or visited status
- Plan trips with multiple destinations
- Track activities for each destination
- Manage accommodation options
- View travel statistics on a dashboard

## Tech Stack

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Wouter** - Lightweight routing
- **React Query** - Data fetching and state management
- **Shadcn UI** - Component library with Radix UI primitives

### Backend
- **Express** - Node.js web framework
- **TypeScript** - Type safety
- **Drizzle ORM** - SQL ORM
- **Zod** - Schema validation
- **PostgreSQL** - Database

### Build & Development
- **Vite** - Development server and bundler
- **TSX** - TypeScript execution environment
- **ESBuild** - Fast JavaScript bundler
- **Replit** - Development and deployment platform

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- A Replit account (for deployment)

### Environment Setup

The application requires a PostgreSQL database. On Replit, this is provisioned automatically.

Create a `.env` file with the following variables:
```
DATABASE_URL=postgresql://username:password@localhost:5432/wanderlust
NODE_ENV=development
```

### Installation

```bash
# Install dependencies
npm install

# Push database schema to the database
npm run db:push
```

### Development

```bash
# Start the development server
npm run dev
```

The application will be available at http://localhost:5000.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build the application for production |
| `npm run start` | Start the production server |
| `npm run check` | Type-check the application |
| `npm run db:push` | Push database schema changes to the database |

## Project Architecture

### Directory Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # UI components
│   │   │   ├── forms/      # Form components
│   │   │   └── ui/         # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   ├── pages/          # Page components
│   │   ├── App.tsx         # Main application component
│   │   └── main.tsx        # Application entry point
│   └── index.html          # HTML template
├── server/                 # Backend Express application
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Database interactions
│   └── vite.ts             # Vite configuration for server
├── shared/                 # Shared code between frontend and backend
│   └── schema.ts           # Database schema and type definitions
└── config files            # Various configuration files
```

### Data Flow

1. **Client**: React components use React Query to fetch data from the API
2. **API**: Express routes validate requests using Zod schemas
3. **Storage**: The storage layer handles database interactions using Drizzle ORM
4. **Database**: PostgreSQL stores application data

## API Endpoints

### Destinations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/destinations` | Get all destinations |
| GET | `/api/destinations/:id` | Get a single destination |
| POST | `/api/destinations` | Create a new destination |
| PUT | `/api/destinations/:id` | Update a destination |
| DELETE | `/api/destinations/:id` | Delete a destination |

### Activities

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/activities` | Get all activities |
| GET | `/api/activities?destinationId=1` | Get activities for a destination |
| GET | `/api/activities/:id` | Get a single activity |
| POST | `/api/activities` | Create a new activity |
| PUT | `/api/activities/:id` | Update an activity |
| DELETE | `/api/activities/:id` | Delete an activity |

### Accommodations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/accommodations` | Get all accommodations |
| GET | `/api/accommodations?destinationId=1` | Get accommodations for a destination |
| GET | `/api/accommodations/:id` | Get a single accommodation |
| POST | `/api/accommodations` | Create a new accommodation |
| PUT | `/api/accommodations/:id` | Update an accommodation |
| DELETE | `/api/accommodations/:id` | Delete an accommodation |

### Trips

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trips` | Get all trips |
| GET | `/api/trips/:id` | Get a single trip |
| POST | `/api/trips` | Create a new trip |
| PUT | `/api/trips/:id` | Update a trip |
| DELETE | `/api/trips/:id` | Delete a trip |

### Trip Destinations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trips/:tripId/destinations` | Get destinations for a trip |
| POST | `/api/trips/:tripId/destinations` | Add a destination to a trip |
| DELETE | `/api/trips/:tripId/destinations/:destinationId` | Remove a destination from a trip |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get dashboard statistics |

## Deployment

This application is configured to deploy on Replit's Autoscale service.

The deployment configuration is defined in the `.replit` file:
- **Build command**: `npm run build`
- **Run command**: `npm run start`

## Development Notes

- The application uses an in-memory database for development by default
- Production deployments should use a persistent database
- React components use the ShadCN UI library for consistent styling
- Form validations use Zod schemas that match the database schema

## License

MIT
