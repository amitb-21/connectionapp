import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { auth } from "@/config/firebase";

const API_URL = "http://localhost:5050";

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

export const getAllPosts = createAsyncThunk(
  "post/getAllPosts",
  async ({ page = 1, limit = 10 }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return thunkAPI.rejectWithValue({
          message: "Authentication token not found"
        });
      }
      
      const response = await api.get(`/posts?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        message: error.response?.data?.message || "Failed to fetch posts"
      });
    }
  }
);

export const createPost = createAsyncThunk(
  "post/createPost",
  async (postData, thunkAPI) => {
    try {
      const formData = new FormData();
      
      if (postData.file) {
        formData.append("media", postData.file);
      }
      
      if (postData.body) {
        formData.append("body", postData.body);
      }
      
      const formConfig = {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      };
      
      const response = await api.post("/posts", formData, formConfig);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        message: error.response?.data?.message || "Failed to create post"
      });
    }
  }
);

export const deletePost = createAsyncThunk(
  "post/deletePost",
  async ({ post_id }, thunkAPI) => {
    try {
      const response = await api.delete(`/posts/${post_id}/delete`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        message: error.response?.data?.message || "Failed to delete post"
      });
    }
  }
);

export const getCommentsByPost = createAsyncThunk(
  "post/getCommentsByPost",
  async ({ post_id, page = 1, limit = 10 }, thunkAPI) => {
    try {
      const response = await api.get(
        `/posts/${post_id}/comments?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        message: error.response?.data?.message || "Failed to fetch comments"
      });
    }
  }
);

export const commentPost = createAsyncThunk(
  "post/commentPost",
  async ({ post_id, commentBody }, thunkAPI) => {
    try {
      const response = await api.post(
        `/posts/${post_id}/comment`,
        { commentBody }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        message: error.response?.data?.message || "Failed to add comment"
      });
    }
  }
);

export const deleteComment = createAsyncThunk(
  "post/deleteComment",
  async ({ comment_id, post_id }, thunkAPI) => {
    try {
      const response = await api.delete(`/comments/${comment_id}/delete`);
      return { ...response.data, post_id };
    } catch (error) {
      return thunkAPI.rejectWithValue({
        message: error.response?.data?.message || "Failed to delete comment"
      });
    }
  }
);


export const toggleLike = createAsyncThunk(
  "post/toggleLike",
  async ({ post_id }, thunkAPI) => {
    try {
      const response = await api.post(`/posts/${post_id}/like`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        message: error.response?.data?.message || "Failed to toggle like"
      });
    }
  }
);

export const get_likes_by_post = createAsyncThunk(
  "post/getLikesByPost",
  async ({ post_id }, thunkAPI) => {
    try {
      const response = await api.get(`/posts/${post_id}/likes`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        message: error.response?.data?.message || "Failed to fetch likes"
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
