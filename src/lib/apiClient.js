import axios from 'axios';
import axiosRetry from 'axios-retry';
import keycloak from '../Keycloak';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000, 
    headers: {
        'Content-Type': 'application/json'
    }
});

// Circuit Breaker State
let failureCount = 0;
let isCircuitOpen = false;

// 1. Safe Retry Logic Configuration
axiosRetry(api, { 
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
        const status = error.response?.status;
        const method = error.config?.method?.toLowerCase();
        
        // Only retry SAFE requesting methods to prevent destructive side-effects
        const isSafeMethod = ['get', 'head', 'options', 'put'].includes(method);
        
        return isSafeMethod && (axiosRetry.isNetworkOrIdempotentRequestError(error) || status >= 500);
    }
});

// 2. Request Interceptor (Circuit Breaker Check & Auth)
api.interceptors.request.use(
    (config) => {
        // Fast-fail if the circuit is open
        if (isCircuitOpen) {
            return Promise.reject(new Error('Circuit Breaker is OPEN: Backend is currently unresponsive.'));
        }

        if (keycloak && keycloak.token) {
            config.headers.Authorization = `Bearer ${keycloak.token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 3. Response Interceptor (Circuit Breaker State Machine)
api.interceptors.response.use(
    (response) => {
        // Success resets the circuit breaker
        failureCount = 0;
        return response.data;
    },
    (error) => {
        // Increment circuit breaker on 5xx or Network timeouts
        if (!error.response || error.response.status >= 500) {
            failureCount++;
            if (failureCount >= 5 && !isCircuitOpen) {
                isCircuitOpen = true;
                
                setTimeout(() => {
                    isCircuitOpen = false;
                    failureCount = 0;
                }, 30000); // 30s cooldown
            }
        }

        return Promise.reject(error);
    }
);

export default api;
