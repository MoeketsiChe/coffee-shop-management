# Kofi & CO – Coffee Shop Management Website

## 1. Project Overview

Kofi & CO is a modern coffee shop website designed to provide customers with a convenient way to explore the menu, place orders and track their orders online.

The system also includes a staff management section that allows authorised staff to manage products, process customer orders and view daily sales reports.

The website uses a premium design inspired by luxury coffee shops, featuring a dark colour scheme with gold accents.

## 2. Project Objectives

- Develop a user-friendly coffee shop website.
- Display available coffee, cold drinks, bakery products and food.
- Allow customers to add products to a shopping cart.
- Enable customers to place orders online.
- Allow customers to track their orders.
- Provide staff with tools to manage menu products.
- Allow staff to update order statuses.
- Generate daily sales reports.
- Store application data using a cloud-based database service.

## 3. Technologies Used

### Frontend
- React.js
- Vite
- JavaScript
- HTML5
- CSS3

### Backend
- Node.js
- Express.js
- REST API
- JSON Web Token (JWT)
- bcryptjs

### Database / Storage
- Upstash Redis

## 4. Main Features

### Customer Section
- Browse the coffee shop menu.
- Search for products.
- Filter and sort menu items.
- View product information and prices.
- Add products to the shopping cart.
- Place customer orders.
- Receive an order number.
- Track order progress.

### Staff Section
- Secure staff login.
- Add new menu products.
- Edit existing products.
- Delete products.
- Manage customer orders.
- Update order statuses.
- View daily sales reports.

### Order Management

Orders can have the following statuses:

1. Pending
2. Preparing
3. Ready
4. Collected

## 5. Project Structure

```text
coffee-shop-management/
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── src/
│   │   └── server.js
│   ├── .env
│   ├── .gitignore
│   └── package.json
│
└── README.md
```

## 6. Installation and Setup

### Requirements

Install the following before running the project:

- Node.js
- npm
- A code editor such as Visual Studio Code
- An Upstash Redis account and database

### Step 1: Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
```

### Step 2: Open the Project

```bash
cd coffee-shop-management
```

### Step 3: Install Frontend Dependencies

```bash
cd frontend
npm install
```

### Step 4: Install Backend Dependencies

Open another terminal:

```bash
cd backend
npm install
```

### Step 5: Configure Environment Variables

Create a `.env` file inside the backend folder.

Add the required configuration:

```env
PORT=5000
REDIS_URL=YOUR_UPSTASH_REDIS_URL
JWT_SECRET=YOUR_SECRET_KEY
```

Replace the placeholder values with your actual credentials. Never upload your `.env` file or expose your secret keys publicly.

### Step 6: Run the Backend

Inside the backend folder:

```bash
npm run dev
```

The backend runs at:

```text
http://localhost:5000
```

### Step 7: Run the Frontend

Inside the frontend folder:

```bash
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

Open the frontend address in your browser.

## 7. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Staff login |
| GET | `/api/health` | Check server status |
| GET | `/api/menu` | Retrieve menu products |
| GET | `/api/menu/:id` | Retrieve one product |
| POST | `/api/menu` | Add a product |
| PUT | `/api/menu` | Update a product |
| DELETE | `/api/menu` | Delete a product |
| POST | `/api/orders` | Create an order |
| GET | `/api/orders` | Retrieve orders |
| GET | `/api/orders/:id` | Track an order |
| PATCH | `/api/orders/:id/status` | Update order status |
| GET | `/api/reports/daily` | Retrieve daily sales report |

Some endpoints require staff authentication.

## 8. Design and User Interface

The website uses a premium coffee-shop design with:

- Black and dark-brown backgrounds.
- Gold highlights and buttons.
- Cream-coloured text.
- High-quality coffee and food photography.
- Responsive layouts for different screen sizes.
- Clear navigation and product presentation.

## 9. Security

The application includes:

- Password hashing using bcryptjs.
- JWT-based staff authentication.
- Protected staff management endpoints.
- Environment variables for sensitive credentials.
- Server-side validation for application requests.

## 10. Future Improvements

Possible future improvements include:

- Online payment integration.
- Customer account registration.
- Order notifications.
- Customer order history.
- Inventory management.
- More detailed sales analytics.

## 11. Conclusion

Kofi & CO demonstrates how modern web technologies can be used to develop a coffee shop management system. It combines an online ordering experience with staff management functionality, helping improve order processing, menu management and daily business operations.

---

**Project Name:** Kofi & CO  
**Project Type:** Coffee Shop Management Website  
**Frontend:** React.js and Vite  
**Backend:** Node.js and Express.js  
**Storage:** Upstash Redis
