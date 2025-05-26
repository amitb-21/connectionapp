import { Router } from "express";
import multer from "multer";
import { authenticateUser } from "../middlewares/authMiddleware.js"; 
import { 
    activeCheck, 
    createPost, 
    getAllPosts, 
    deletePost,
    get_comments_by_post,
    commentPost,
    delete_comment_of_user,
    toggle_like,
    get_likes_by_post,
    getPostsByUsername
} from "../controllers/posts.controller.js";

const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage });

router.get("/", activeCheck);

// ✅ Posts routes
router.post("/posts", authenticateUser, upload.single("media"), createPost);
router.get("/posts", getAllPosts);
router.delete("/posts/:post_id/delete", authenticateUser, deletePost);
router.get("/posts/user/:username", getPostsByUsername);

// ✅ Comments routes
router.post("/posts/:post_id/comment", authenticateUser, commentPost);
router.get("/posts/:post_id/comments", get_comments_by_post);
router.delete("/comments/:comment_id/delete", authenticateUser, delete_comment_of_user);

// ✅ Likes routes
router.post("/posts/:post_id/like", authenticateUser, toggle_like);
router.get("/posts/:post_id/likes", get_likes_by_post);

export default router;
