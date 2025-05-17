# Cover Carousel Creator

A web application for creating and managing digital photo albums, with secure password protection and QR code sharing functionality.

## Features

- Upload and compress images
- Create password-protected albums
- Generate QR codes for easy sharing
- Progress tracking for uploads
- Responsive UI for all devices
- MongoDB backend for persistent storage

## Tech Stack

- **Frontend**:
  - React with TypeScript
  - Vite as build tool
  - Tailwind CSS with shadcn/ui components
  - React Router for navigation
  - Framer Motion for animations
  - Cloudinary for image hosting

- **Backend**:
  - Node.js with Express
  - MongoDB for database
  - Mongoose for MongoDB object modeling

## Setup Instructions

### Prerequisites

- Node.js (v14 or later)
- MongoDB (local installation or MongoDB Atlas account)

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the server directory with the following content:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/cover-carousel
   ```
   
   For MongoDB Atlas, use the connection string:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/cover-carousel?retryWrites=true&w=majority
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the project root directory

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with Cloudinary and API configuration:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:5173 in your browser

## Deployment

### Backend Deployment

1. Configure your MongoDB Atlas connection string in the server's `.env` file
2. Deploy to your preferred hosting service (Heroku, Render, etc.)

### Frontend Deployment

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Deploy the `dist` directory to your hosting service

## License

MIT
