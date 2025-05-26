import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducer/authReducer";
import postsReducer from "./reducer/postReducer";

const store = configureStore({
    reducer: {
        auth: authReducer,
        posts: postsReducer,
    },
});

export default store;
