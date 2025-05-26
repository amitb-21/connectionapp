import { createAsyncThunk } from "@reduxjs/toolkit";
import { auth } from "@/config/firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import axios from "axios";
import { BASE_URL } from "@/config";

const API_URL = BASE_URL; 
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const loginUser = createAsyncThunk(
  "user/login",
  async (user, thunkAPI) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        user.email.trim(), 
        user.password.trim()
      );
      
      const token = await userCredential.user.getIdToken();
      localStorage.setItem("token", token);
      
      const response = await api.get("/get_user_and_profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return {
        user: response.data,
        token
      };
    } catch (error) {
      return thunkAPI.rejectWithValue({
        message: error.message || "Login failed"
      });
    }
  }
);

export const registerUser = createAsyncThunk(
  "user/register",
  async (user, thunkAPI) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        user.email.trim(),
        user.password.trim()
      );
      
      const token = await userCredential.user.getIdToken();
      localStorage.setItem("token", token);
      
      const response = await api.post("/register", {
        name: user.name,
        email: user.email.trim(),
        username: user.username,
        firebaseUid: userCredential.user.uid
      });
      
      return { message: "User Created successfully" };
    } catch (error) {
      if (error.response && auth.currentUser) {
        await auth.currentUser.delete();
      }
      
      return thunkAPI.rejectWithValue({
        message: error.response?.data?.message || error.message || "Registration failed"
      });
    }
  }
);

export const logoutUser = createAsyncThunk(
  "user/logout",
  async (_, thunkAPI) => {
    try {
      await signOut(auth);
      localStorage.removeItem("token");
      return { message: "Logged out successfully" };
    } catch (error) {
      return thunkAPI.rejectWithValue({
        message: error.message || "Logout failed"
      });
    }
  }
);

export const getAboutUser = createAsyncThunk(
  "user/getAboutUser",
  async (_, thunkAPI) => {
    try {
      const response = await api.get("/get_user_and_profile");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        message: error.response?.data?.message || error.message || "Failed to get user"
      });
    }
  }
);

export const getUserByFirebaseUid = createAsyncThunk(
  "user/getUserByFirebaseUid",
  async ({ firebaseUid }, thunkAPI) => {
    try {
      const response = await api.get(`/user/firebase/${firebaseUid}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        message: error.response?.data?.message || error.message || "Failed to get user by Firebase UID"
      });
    }
  }
);

export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async (_, thunkAPI) => {
    try {
      const response = await api.get("/user/get_all_users");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        message: error.response?.data?.message || error.message || "Failed to get users"
      });
    }
  }
);

export const getUserProfileAndUserBasedOnUsername = createAsyncThunk(
  "user/getUserProfileAndUserBasedOnUsername",
  async ({ username }, thunkAPI) => {
    try {
      const response = await api.get(`/user/profile/${username}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        message: error.response?.data?.message || error.message || "Failed to get user profile"
      });
    }
  }
);

export const sendConnectionRequest = createAsyncThunk(
  "user/sendConnectionRequest",
  async ({ connectionId }, thunkAPI) => {
    try {
      const response = await api.post("/user/sendConnectionRequest", { connectionId });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        message: error.response?.data?.message || "Failed to send connection request"
      });
    }
  }
);

export const getMyConnectionRequests = createAsyncThunk(
  "user/getMyConnectionRequests",
  async (_, thunkAPI) => {
    try {
      const response = await api.get("/user/getMyConnectionRequests");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        message: error.response?.data?.message || "Failed to get connection requests"
      });
    }
  }
);

export const whatAreMyConnections = createAsyncThunk(
  "user/whatAreMyConnections",
  async (_, thunkAPI) => {
    try {
      const response = await api.get("/user/whatAreMyConnections");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        message: error.response?.data?.message || "Failed to get connections"
      });
    }
  }
);

export const acceptConnectionRequest = createAsyncThunk(
  "user/acceptConnectionRequest",
  async ({ userId }, thunkAPI) => {
    try {
      const response = await api.post("/user/acceptConnectionRequest", { userId });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        message: error.response?.data?.message || "Failed to accept connection request"
      });
    }
  }
);

export const rejectConnectionRequest = createAsyncThunk(
  "user/rejectConnectionRequest",
  async ({ userId }, thunkAPI) => {
    try {
      const response = await api.post("/user/rejectConnectionRequest", { userId });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        message: error.response?.data?.message || "Failed to reject connection request"
      });
    }
  }
);  

export const toggleConnectionRequest = createAsyncThunk(
  "user/toggleConnectionRequest",
  async ({ connectionId }, thunkAPI) => {
    try {
      const response = await api.post("/user/toggleConnectionRequest", { connectionId });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        message: error.response?.data?.message || "Failed to process connection request"
      });
    }
  }
);

export const getConnectionStatus = createAsyncThunk(
  "user/getConnectionStatus",
  async ({ targetUserId }, thunkAPI) => {
    try {
      const response = await api.get(`/user/connectionStatus/${targetUserId}`);
      return { ...response.data, targetUserId };
    } catch (error) {
      return thunkAPI.rejectWithValue({
        message: error.response?.data?.message || "Failed to get connection status"
      });
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "user/updateUserProfile",
  async (userData, thunkAPI) => {
    try {
      const response = await api.post("/user_update", userData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        message: error.response?.data?.message || "Failed to update user profile"
      });
    }
  }
);

export const updateProfileData = createAsyncThunk(
  "user/updateProfileData",
  async (profileData, thunkAPI) => {
    try {
      const response = await api.post("/update_profile_data", profileData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        message: error.response?.data?.message || "Failed to update profile data"
      });
    }
  }
);

export const uploadProfilePicture = createAsyncThunk(
  "user/uploadProfilePicture",
  async (formData, thunkAPI) => {
    try {
      const response = await api.post("/update_profile_picture", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        message: error.response?.data?.message || "Failed to upload profile picture"
      });
    }
  }
);

export const downloadProfile = createAsyncThunk(
  "user/downloadProfile",
  async (userId, thunkAPI) => {
    try {
      const response = await api.get(`/user/download_resume/${userId || ''}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : 'profile.pdf';
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { message: "Profile downloaded successfully" };
    } catch (error) {
      return thunkAPI.rejectWithValue({
        message: error.response?.data?.message || "Failed to download profile"
      });
    }
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const user = auth.currentUser;
        if (user) {
          const newToken = await user.getIdToken(true);
          localStorage.setItem("token", newToken);
          
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
