
# Cashier API

This project is designed to handle a cafe management system, including order processing, receipt printing, table management, and user authentication. It leverages technologies like Express.js, Prisma ORM, PostgreSQL, and JWT-based authentication.


## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing.

### Prerequisites
Make sure you have the following software installed on your system:

- Node.js (v14 or higher recommended)
- PostgreSQL (v12 or higher recommended)
- Prisma
- Git
### Installation

1. **Clone the repository**:

```bash
  git clone https://github.com/Abdulzizi/UKLXIIRPL1.git
  cd UKLXIIRPL1
```

2. **Install dependencies:**:

```bash
  npm install
```

3. **Set up the database: Use Prisma to set up your database with the following commands:**:

```bash
  npx prisma migrate dev
  npx prisma generate
```

## Enviroment Variables
Create a `.env` file in the root directory of the project and add the following variables:

```bash
  DATABASE_URL=your_postgresql_database_url
  JWT_SECRET=your_secret_key
```

- Replace `your_postgresql_database_url` with your actual database connection string.
- Replace `your_secret_key` with a strong secret key for JWT.

## API Documentation

Just some information u can rely on.

### **Authentication Routes**

- POST `/login` - Authenticate and get a JWT token.
- POST `/register` - Register a new user.

### **Transaction Routes**

- POST `/transaction` - Create a new order.
- GET `/transaction` - Retrieve a list of transactions with filters.
- GET `/transaction/:orderId/receipt` - Print a receipt for a - specific order.
- PUT `/transaction/:orderId` - Update an existing order.
- DELETE `/transaction/:orderId` - Delete an order.

### **Middlewares**

- **authenticate**: Verifies if the user is logged in and the token is valid.
- **authorize**: Checks if the user has the required role to access a route.

## Tech Stack

- **Express.js** - Backend framework for building the API.
- **Prisma ORM** - Object-Relational Mapping tool for database interaction.
- **PostgreSQL** - Relational database for storing data.
- **JWT** - JSON Web Token for handling authentication.
- **Node.js** - JavaScript runtime environment for executing server-side code.

## Contributing

If you would like to contribute to this project, please fork the repository and submit a pull request with your changes.

Contributions are always welcome!

-  Fork the project.
-  Create a new branch `(git checkout -b feature/YourFeature)`.
-  Commit your changes `(git commit -m 'Add some feature')`.
-  Push to the branch `(git push origin feature/YourFeature)`.
-  Open a pull request.

## License

This project is licensed under the MIT License - see the 
[MIT](https://choosealicense.com/licenses/mit/)
file for details.


## Authors

- [Abdulzizi](https://www.github.com/Abdulzizi)
