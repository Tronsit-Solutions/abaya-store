# React Native Mobile App Integration Guide

## Overview
This guide will help you integrate your Das Club Rails API with a React Native mobile application.

## API Base URL
```
Development: http://localhost:3000
Production: [Your production URL]
```

## Authentication Endpoints

### 1. Sign Up
**POST** `/api/v1/sign_up`

**Request Body:**
```json
{
  "user": {
    "email": "user@example.com",
    "password": "password123",
    "password_confirmation": "password123"
  }
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

**Response (Error - 422):**
```json
{
  "error": "Email has already been taken"
}
```

### 2. Sign In
**POST** `/api/v1/sign_in`

**Request Body:**
```json
{
  "user": {
    "email": "user@example.com",
    "password": "password123"
  }
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Signed in successfully",
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

**Response (Error - 401):**
```json
{
  "error": "Invalid email or password"
}
```

### 3. Sign Out
**DELETE** `/api/v1/sign_out`

**Headers:**
```
Authorization: [JWT Token from sign in response]
```

**Response (Success - 200):**
```json
{
  "message": "Signed out successfully"
}
```

### 4. Get Current User
**GET** `/api/v1/me`

**Headers:**
```
Authorization: [JWT Token]
```

**Response (Success - 200):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

## Products Endpoints

### 1. List Products
**GET** `/api/v1/products`

**Query Parameters:**
- `search` (optional): Search by product name
- `page` (optional): Page number for pagination
- `per_page` (optional): Items per page (default: 12)

**Example:**
```
GET /api/v1/products?search=abaya&page=1&per_page=12
```

**Response:**
```json
{
  "products": [
    {
      "id": 1,
      "name": "Classic Black Abaya",
      "description": "Timeless elegance...",
      "price": 89.99,
      "stock": 25,
      "available": true,
      "image_url": "http://localhost:3000/rails/active_storage/...",
      "created_at": "2025-10-16T22:42:22.614Z",
      "updated_at": "2025-10-16T22:42:22.614Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_count": 50
  }
}
```

### 2. Get Single Product
**GET** `/api/v1/products/:id`

**Example:**
```
GET /api/v1/products/1
```

**Response:**
```json
{
  "id": 1,
  "name": "Classic Black Abaya",
  "description": "Timeless elegance in premium black fabric...",
  "price": 89.99,
  "stock": 25,
  "available": true,
  "image_url": "http://localhost:3000/rails/active_storage/...",
  "created_at": "2025-10-16T22:42:22.614Z",
  "updated_at": "2025-10-16T22:42:22.614Z"
}
```

## React Native Implementation

### Troubleshooting "Metro Stream 1001" Error

If you encounter "disconnected from metro stream 1001" error:

1. **Restart Metro with cache reset:**
   ```bash
   npx expo start -c
   # or
   yarn start --reset-cache
   ```

2. **Check API URL - Use your computer's IP address, not localhost:**
   - On Mac/Linux: `ifconfig | grep "inet " | grep -v 127.0.0.1`
   - Use: `http://192.168.x.x:3000` (your actual IP)
   - Don't use: `http://localhost:3000`

3. **Restart Rails server** after CORS changes:
   ```bash
   pkill -f "rails server"
   bundle exec rails server
   ```

### Required Packages

```bash
npm install @react-navigation/native @react-navigation/native-stack
npm install @tanstack/react-query axios
npm install expo-secure-store
npm install @expo/vector-icons
```

### 1. Setup API Client

**api/client.js**
```javascript
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://localhost:3000/api/v1';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
client.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('auth_token');
    }
    return Promise.reject(error);
  }
);

export default client;
```

### 2. Auth Service

**services/auth.js**
```javascript
import client from '../api/client';
import * as SecureStore from 'expo-secure-store';

export const authService = {
  async signIn(email, password) {
    const response = await client.post('/sign_in', {
      user: { email, password },
    });
    // Store token from response
    await SecureStore.setItemAsync('auth_token', response.data.token);
    return response.data;
  },

  async signUp(email, password, passwordConfirmation) {
    const response = await client.post('/sign_up', {
      user: { email, password, password_confirmation: passwordConfirmation },
    });
    await SecureStore.setItemAsync('auth_token', response.data.token);
    return response.data;
  },

  async signOut() {
    await client.delete('/sign_out');
    await SecureStore.deleteItemAsync('auth_token');
  },

  async getCurrentUser() {
    const response = await client.get('/me');
    return response.data;
  },
};
```

### 3. Products Service

**services/products.js**
```javascript
import client from '../api/client';

export const productsService = {
  async getProducts(params = {}) {
    const response = await client.get('/products', { params });
    return response.data;
  },

  async getProduct(id) {
    const response = await client.get(`/products/${id}`);
    return response.data;
  },
};
```

### 4. Example Sign In Screen

**screens/SignInScreen.js**
```javascript
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { authService } from '../services/auth';

export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    try {
      await authService.signIn(email, password);
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Sign in failed');
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Sign In</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
      />
      <Button title="Sign In" onPress={handleSignIn} />
      <Button
        title="Sign Up"
        onPress={() => navigation.navigate('SignUp')}
      />
    </View>
  );
}
```

### 5. Example Products Screen

**screens/ProductsScreen.js**
```javascript
import React from 'react';
import { View, Text, FlatList, Image } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { productsService } from '../services/products';

export default function ProductsScreen({ navigation }) {
  const { data, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsService.getProducts(),
  });

  if (isLoading) return <Text>Loading...</Text>;

  return (
    <FlatList
      data={data?.products || []}
      renderItem={({ item }) => (
        <View style={{ padding: 10, borderBottomWidth: 1 }}>
          {item.image_url && (
            <Image
              source={{ uri: item.image_url }}
              style={{ width: 100, height: 100 }}
            />
          )}
          <Text style={{ fontSize: 18 }}>{item.name}</Text>
          <Text>${item.price}</Text>
          <Text>{item.description}</Text>
        </View>
      )}
      keyExtractor={(item) => item.id.toString()}
    />
  );
}
```

## Testing the API

### Using cURL

**Sign In:**
```bash
curl -X POST http://localhost:3000/api/v1/sign_in \
  -H "Content-Type: application/json" \
  -d '{"user":{"email":"user@example.com","password":"password123"}}'
```

**Get Products:**
```bash
curl -X GET http://localhost:3000/api/v1/products
```

## Theme Colors
Use these colors to match your mobile app with the web design:
- Light Beige: `#FEFCF8`
- Beige: `#F5F5DC`
- Brown-Black: `#2C1810`
- Warm Beige: `#F7F3E9`
- Amber: `#D97706`

## Next Steps
1. Set up React Native project with Expo
2. Install required packages
3. Implement authentication flow
4. Build product listing and detail screens
5. Add cart functionality
6. Implement checkout with Stripe

