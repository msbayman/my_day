import axios from 'axios';
import { cookies } from 'next/headers';


const apiServer = axios.create({
   baseURL: 'http://localhost:8000/api/',
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
   failedQueue.forEach(prom => {
      if (error) {
         prom.reject(error);
      } else {
         prom.resolve(token);
      }
   });
   failedQueue = [];
};


apiServer.interceptors.request.use(
   async (config) => {
      const cookieStore = await cookies();
      const token = cookieStore.get('access_token')?.value;

      if (token) {
         config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
   },
   (error) => {
      return Promise.reject(error);
   }
);


apiServer.interceptors.response.use(
   (response) => response,
   async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {

         if (isRefreshing) {
            return new Promise((resolve, reject) => {
               failedQueue.push({ resolve, reject });
            }).then(() => {
               return apiServer(originalRequest);
            });
         }

         originalRequest._retry = true;
         isRefreshing = true;

         try {
            const cookieStore = await cookies();
            const refreshToken = cookieStore.get('refresh_token')?.value;

            const response = await axios.post('http://localhost:8000/api/token/refresh/', {
               refresh: refreshToken
            });

            const newAccessToken = response.data.access;
            const cookieStore2 = await cookies();
            cookieStore2.set('access_token', newAccessToken, {
               httpOnly: true,
               maxAge: 60 * 60 * 24 * 7
            });
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            processQueue(null, newAccessToken);
            return apiServer(originalRequest);

         } catch (refreshError) {
            processQueue(refreshError, null);
            const cookieStore = await cookies();
            cookieStore.delete('access_token');
            cookieStore.delete('refresh_token');
            throw new Error('Authentication failed');
         } finally {
            isRefreshing = false;
         }
      }

      throw error;
   }
);

export default apiServer;