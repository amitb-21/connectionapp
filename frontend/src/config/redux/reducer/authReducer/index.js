import { createSlice } from "@reduxjs/toolkit";
import {
  loginUser,
  registerUser,
  logoutUser,
  getAboutUser,
  getAllUsers,
  getUserByFirebaseUid,
  getUserProfileAndUserBasedOnUsername,
  sendConnectionRequest,
  getMyConnectionRequests,
  whatAreMyConnections,
  acceptConnectionRequest,
  rejectConnectionRequest,
  toggleConnectionRequest,
  getConnectionStatus,
  updateUserProfile,
  updateProfileData,
  uploadProfilePicture,
  downloadProfile,
  getMySentConnectionRequests
} from "../../action/authAction";

const initialState = {
  user: null,
  profile: null,
  token: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
  loggedIn: false,
  isTokenThere: false,
  profileFetched: false,
  connections: [],
  connectionRequests: [],
  all_users: [],
  all_profiles_fetched: false,
  viewedUserProfile: null, // For storing viewed user profile data
  connectionStatuses: {}, // For storing connection statuses by userId
  userByFirebaseUid: null, // For storing user fetched by Firebase UID
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.loggedIn = true;
    },
    resetState: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = "";
    },
    setTokenIsThere: (state) => {
      state.isTokenThere = true;
    },
    setTokenIsNotThere: (state) => {
      state.isTokenThere = false;
    },
    clearViewedUserProfile: (state) => {
      state.viewedUserProfile = null;
    },
    clearUserByFirebaseUid: (state) => {
      state.userByFirebaseUid = null;
    },
  },
  extraReducers: (builder) => {
    // Login cases
    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.loggedIn = true;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message = action.payload.message;
      state.user = null;
      state.loggedIn = false;
    });

    // Register cases
    builder.addCase(registerUser.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.message = action.payload.message;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message = action.payload.message;
    });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.profile = null;
      state.token = null;
      state.loggedIn = false;
      state.connections = [];
      state.connectionRequests = [];
      state.viewedUserProfile = null;
      state.connectionStatuses = {};
      state.userByFirebaseUid = null;
    });

    // Get about user
    builder.addCase(getAboutUser.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getAboutUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.profileFetched = true;
      state.user = action.payload.user;
      state.profile = action.payload.profile;
    });
    builder.addCase(getAboutUser.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message = action.payload.message;
    });

    // Get user by Firebase UID
    builder.addCase(getUserByFirebaseUid.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getUserByFirebaseUid.fulfilled, (state, action) => {
      state.isLoading = false;
      state.userByFirebaseUid = action.payload;
    });
    builder.addCase(getUserByFirebaseUid.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message = action.payload.message;
    });

    // Get user profile by username
    builder.addCase(getUserProfileAndUserBasedOnUsername.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getUserProfileAndUserBasedOnUsername.fulfilled, (state, action) => {
      state.isLoading = false;
      state.viewedUserProfile = action.payload;
    });
    builder.addCase(getUserProfileAndUserBasedOnUsername.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message = action.payload.message;
    });

    // Get all users
    builder.addCase(getAllUsers.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getAllUsers.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.all_profiles_fetched = true;
      state.all_users = action.payload.users;
    });
    builder.addCase(getAllUsers.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message = action.payload.message;
    });

    // Send connection request
    builder.addCase(sendConnectionRequest.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(sendConnectionRequest.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.message = action.payload.message;
    });
    builder.addCase(sendConnectionRequest.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message = action.payload.message;
    });

    // Get my connection requests
    builder.addCase(getMyConnectionRequests.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getMyConnectionRequests.fulfilled, (state, action) => {
      state.isLoading = false;
      state.connectionRequests = action.payload.connectionRequests;
    });
    builder.addCase(getMyConnectionRequests.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message = action.payload.message;
    });

    // Get my connections
    builder.addCase(whatAreMyConnections.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(whatAreMyConnections.fulfilled, (state, action) => {
      state.isLoading = false;
      state.connections = action.payload.connections;
    });
    builder.addCase(whatAreMyConnections.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message = action.payload.message;
    });

    // Accept connection request
    builder.addCase(acceptConnectionRequest.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(acceptConnectionRequest.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.message = action.payload.message;
      // Remove the accepted request from connectionRequests
      state.connectionRequests = state.connectionRequests.filter(
        (request) => request._id !== action.meta.arg.userId
      );
    });
    builder.addCase(acceptConnectionRequest.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message = action.payload.message;
    });

    // Reject connection request
    builder.addCase(rejectConnectionRequest.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(rejectConnectionRequest.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.message = action.payload.message;
      // Remove the rejected request from connectionRequests
      state.connectionRequests = state.connectionRequests.filter(
        (request) => request._id !== action.meta.arg.userId
      );
    });
    builder.addCase(rejectConnectionRequest.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message = action.payload.message;
    });

    // Toggle connection request (send/withdraw/unfriend)
    builder.addCase(toggleConnectionRequest.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(toggleConnectionRequest.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.message = action.payload.message;
      
      // Update connection status in viewedUserProfile if viewing someone's profile
      if (state.viewedUserProfile && state.viewedUserProfile.user._id === action.meta.arg.connectionId) {
        // Update connectionStatus based on the action performed
        if (action.payload.message.includes("cancelled") || action.payload.message.includes("removed")) {
          state.viewedUserProfile.connectionStatus = {
            isConnection: false,
            requestSent: false,
            requestReceived: false,
            status: "none"
          };
        }
      }
    });
    builder.addCase(toggleConnectionRequest.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message = action.payload.message;
    });

    // Get connection status
    builder.addCase(getConnectionStatus.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getConnectionStatus.fulfilled, (state, action) => {
      state.isLoading = false;
      const { targetUserId, ...connectionData } = action.payload;
      state.connectionStatuses[targetUserId] = connectionData;
    });
    builder.addCase(getConnectionStatus.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message = action.payload.message;
    });

    // Update user profile
    builder.addCase(updateUserProfile.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(updateUserProfile.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.message = action.payload.message;
      if (action.payload.user) {
        state.user = { ...state.user, ...action.payload.user };
      }
      if (action.payload.profile) {
        state.profile = { ...state.profile, ...action.payload.profile };
      }
    });
    builder.addCase(updateUserProfile.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message = action.payload.message;
    });

    // Update profile data
    builder.addCase(updateProfileData.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(updateProfileData.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.message = action.payload.message;
      if (action.payload.profile) {
        state.profile = { ...state.profile, ...action.payload.profile };
      }
    });
    builder.addCase(updateProfileData.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message = action.payload.message;
    });

    // Upload profile picture
    builder.addCase(uploadProfilePicture.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(uploadProfilePicture.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.message = action.payload.message;
      if (action.payload.profilePicture) {
        state.user = { ...state.user, profilePicture: action.payload.profilePicture };
      }
    });
    builder.addCase(uploadProfilePicture.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message = action.payload.message;
    });

    // Download profile
    builder.addCase(downloadProfile.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(downloadProfile.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.message = action.payload.message;
    });
    builder.addCase(downloadProfile.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message = action.payload.message;
    });
  },
});

export const {
  setUser,
  resetState,
  setTokenIsThere,
  setTokenIsNotThere,
  clearViewedUserProfile,
  clearUserByFirebaseUid,
} = authSlice.actions;

export default authSlice.reducer;