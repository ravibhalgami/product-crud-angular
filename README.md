# Angular Project: User & Admin Dashboard

## 📋 Overview

This project is a **frontend** dashboard system built with **Angular** for both users and admins. It includes features like signup, login, product CRUD (Create, Read, Update, Delete) operations, and a dedicated admin interface for user management. The frontend communicates with a **NestJS** backend API and uses **Firebase** for image storage.

## 🚀 Features

- **User Signup & Login**
- **CRUD Operations** for Products
- **Admin Dashboard** for User Management and Products listing
- **Firebase Integration** for Media Storage

## 🔧 Requirements

Ensure you have the following installed on your system:

- **Node.js**: `^v18.19.1`
- **Angular CLI**: `^v17.3.10`
- **Firebase Account**: For image storage
- **NestJS API**: Backend service (available in a separate repository)

## ⚙️ Installation

Follow these steps to set up and run the project:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/ravibhalgami/product-crud-angular.git

   cd product-crud-angular
   ```

2. **Install dependencies**:

```bash
npm install
Start the development server:
```

3. **Start the development server**:

```bash
ng serve
The app will be accessible at http://localhost:4200.
```

## 🔨 Configuration

You need to set up the NestJS API endpoint in the environment configuration file located at src/environments/environment.development.ts.

### Example Configuration

```bash
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/'
};
```

Ensure the apiUrl points to the correct backend server.

Note: The backend NestJS API must be running separately. Please refer to the respective backend repository for setup instructions.

## 💡 Additional Notes

The project requires a working Firebase account for media storage. Ensure that Firebase is properly configured.
The admin interface is restricted to authorized users only.
