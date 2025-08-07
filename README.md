# Product/Order/Stock Tracking Application

A web application for tracking products, orders, and inventory with detailed cost tracking and analytics.

## Features

- Product Management
  - Track product details (name, price, fees)
  - Monitor inventory levels
  - Track product lifecycle
- Order Management
  - Track incoming orders from sellers
  - Manage outgoing orders to customers
  - Multiple sales channels support (Shopee, Live-selling)
- Cost Tracking
  - Product cost
  - Shipping fees
  - Platform fees (Shopee)
  - Advertisement fees
  - EMS shipping fees
- Analytics & Reporting
  - Revenue tracking
  - Profit calculation
  - Inventory duration analysis
  - Sales channel performance

## Technology Stack

- Frontend: React.js with Material-UI
- Backend: Node.js with Express
- Database: PostgreSQL
- Authentication: JWT
- Hosting: AWS (EC2 + RDS)
- CI/CD: GitHub Actions

## Getting Started

### Prerequisites

- Node.js >= 16
- PostgreSQL >= 13
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd frontend
   npm install
   cd ../backend
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
4. Start the development servers:
   ```bash
   # Start backend
   cd backend
   npm run dev
   
   # Start frontend in another terminal
   cd frontend
   npm start
   ```

## Project Structure

```
product-tracking-app/
├── backend/          # Node.js Express backend
├── frontend/         # React frontend
├── docker/           # Docker configuration
└── docs/            # Documentation
```
