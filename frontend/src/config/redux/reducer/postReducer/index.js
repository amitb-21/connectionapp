import { createSlice } from "@reduxjs/toolkit";
import {
  getAllPosts,
  createPost,
  deletePost,
  commentPost,
  getCommentsByPost,
  deleteComment,
  toggleLike,
  get_likes_by_post
} from "../../action/postAction";

const initialState = {
  posts: [],
  isError: false,
  postFetched: false,
  isLoading: false,
  message: "",
  comments: [],
  postId: "",
  likedByUser: {},
  currentPostLikes: {},
  commentCountsByPostId: {},
  commentsByPostId: {},
  pagination: {
    currentPage: 1,
    totalPages: 1,
    hasMore: false
  },
  commentPagination: {}
};

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    reset: () => initialState,
    resetPostId: (state) => {
      state.postId = "";
    },
    clearComments: (state) => {
      state.comments = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllPosts.pending, (state) => {
        state.isLoading = true;
        state.message = "Fetching posts...";
      })
      .addCase(getAllPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        if (action.meta.arg.page === 1) {
          state.posts = action.payload.posts;
        } else {
          state.posts = [...state.posts, ...action.payload.posts];
        }
        if (action.payload.likedByUser) {
          state.likedByUser = {
            ...state.likedByUser,
            ...action.payload.likedByUser
          };
        } else {
          action.payload.posts.forEach(post => {
            state.likedByUser[post._id] = false;
          });
        }
        
        // Update pagination info
        state.pagination = action.payload.pagination;
        state.postFetched = true;
        state.message = "Posts fetched successfully";
      })
      .addCase(getAllPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload?.message || "Failed to fetch posts";
      })
      .addCase(createPost.pending, (state) => {
        state.isLoading = true;
        state.message = "Creating post...";
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.posts.unshift(action.payload.post);
        state.likedByUser[action.payload.post._id] = false;
        state.message = "Post created successfully";
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload.message;
      })
      .addCase(deletePost.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = state.posts.filter(post => post._id !== action.meta.arg.post_id);
        delete state.likedByUser[action.meta.arg.post_id];
        if (state.currentPostLikes[action.meta.arg.post_id]) {
          delete state.currentPostLikes[action.meta.arg.post_id];
        }
        if (state.commentCountsByPostId[action.meta.arg.post_id]) {
          delete state.commentCountsByPostId[action.meta.arg.post_id];
        }
        state.message = "Post deleted successfully";
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload.message;
      })
      .addCase(getCommentsByPost.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCommentsByPost.fulfilled, (state, action) => {
        state.isLoading = false;
        const postId = action.meta.arg.post_id;

        if (!state.commentsByPostId) {
          state.commentsByPostId = {};
        }
        if (action.meta.arg.page === 1 || !state.commentsByPostId[postId]) {
          state.commentsByPostId[postId] = action.payload.comments;
        } else {
          state.commentsByPostId[postId] = [
            ...state.commentsByPostId[postId], 
            ...action.payload.comments
          ];
        }
        
        state.postId = postId;
        state.commentCountsByPostId[postId] = action.payload.pagination.totalComments;
        
        state.commentPagination[postId] = action.payload.pagination;
      })
      .addCase(getCommentsByPost.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload.message;
      })
      .addCase(commentPost.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(commentPost.fulfilled, (state, action) => {
        state.isLoading = false;
        const postId = action.payload.comment.postId;

        if (!state.commentsByPostId) {
          state.commentsByPostId = {};
        }
        if (!state.commentsByPostId[postId]) {
          state.commentsByPostId[postId] = [];
        }

        state.commentsByPostId[postId].push(action.payload.comment);
        
        if (postId) {
          state.commentCountsByPostId[postId] = (state.commentCountsByPostId[postId] || 0) + 1;
        }
        state.message = "Comment added successfully";
      })
      .addCase(commentPost.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload.message;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        const { comment_id, post_id } = action.meta.arg;
        
        if (state.commentsByPostId && state.commentsByPostId[post_id]) {
          state.commentsByPostId[post_id] = state.commentsByPostId[post_id].filter(
            comment => comment._id !== comment_id
          );
        }
        
        if (post_id && state.commentCountsByPostId[post_id] && state.commentCountsByPostId[post_id] > 0) {
          state.commentCountsByPostId[post_id]--;
        }
        
        state.message = "Comment deleted successfully";
      })
      .addCase(toggleLike.pending, (state, action) => {
        const postId = action.meta.arg.post_id;
        const previousLikedState = state.likedByUser[postId];
        state.likedByUser[postId] = !previousLikedState;
        const postIndex = state.posts.findIndex(post => post._id === postId);
        if (postIndex !== -1) {
          const currentLikes = state.posts[postIndex].likesCount || 0;
          state.posts[postIndex].likesCount = state.likedByUser[postId]
            ? currentLikes + 1
            : Math.max(0, currentLikes - 1);
        }
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const postId = action.meta.arg.post_id;
        const postIndex = state.posts.findIndex(post => post._id === postId);
        if (postIndex !== -1) {
          if (action.payload.likesCount !== undefined) {
            state.posts[postIndex].likesCount = action.payload.likesCount;
          }
          if (action.payload.isLiked !== undefined) {
            state.likedByUser[postId] = action.payload.isLiked;
          }
        }
      })
      .addCase(toggleLike.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload.message || "Failed to toggle like";
        const postId = action.meta.arg.post_id;
        if (postId) {
          state.likedByUser[postId] = !state.likedByUser[postId];
          const postIndex = state.posts.findIndex(post => post._id === postId);
          if (postIndex !== -1) {
            const currentLikes = state.posts[postIndex].likesCount || 0;
            state.posts[postIndex].likesCount = state.likedByUser[postId]
              ? currentLikes + 1
              : Math.max(0, currentLikes - 1);
          }
        }
      })
      .addCase(get_likes_by_post.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(get_likes_by_post.fulfilled, (state, action) => {
        state.isLoading = false;
        const postId = action.meta.arg.post_id;
        state.currentPostLikes[postId] = {
          likesCount: action.payload.likesCount,
          previewLikes: action.payload.previewLikes,
          allLikes: action.payload.allLikes
        };
      })
      .addCase(get_likes_by_post.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload.message;
      });
  }
});

export const { reset, resetPostId, clearComments } = postSlice.actions;
export default postSlice.reducer;
