// backend/routes/user.routes.js
import { Router } from "express";
import multer from "multer";
import { authenticateUser } from "../middlewares/authMiddleware.js";
import { 
    register, 
    uploadProfilePicture, 
    updateUserProfile, 
    getUserAndProfile, 
    updateProfileData, 
    getAllUserProfile, 
    downloadProfile, 
    sendConnectionRequest, 
    getMyConnectionRequests, 
    whatAreMyConnections, 
    acceptConnectionRequest,
    getUserByFirebaseUid,
    rejectConnectionRequest,
    getUserProfileAndUserBasedOnUsername,
    toggleConnectionRequest,
    getConnectionStatus,
    getMySentConnectionRequests
} from "../controllers/user.controller.js";

const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + "-" + file.originalname);
    },
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, 
    }
});

router.post("/register", register);

router.get("/user/firebase/:firebaseUid", getUserByFirebaseUid);
router.post("/update_profile_picture", authenticateUser, upload.single("profile_picture"), uploadProfilePicture);
router.post("/user_update", authenticateUser, updateUserProfile);
router.get("/get_user_and_profile", authenticateUser, getUserAndProfile);
router.post("/update_profile_data", authenticateUser, updateProfileData);

router.get("/user/get_all_users", getAllUserProfile);
router.get("/user/download_resume/:userId?", authenticateUser, downloadProfile);


router.post("/user/sendConnectionRequest", authenticateUser, sendConnectionRequest);
router.get("/user/getMyConnectionRequests", authenticateUser, getMyConnectionRequests);
router.get("/user/getMySentConnectionRequests", authenticateUser, getMySentConnectionRequests);
router.get("/user/whatAreMyConnections", authenticateUser, whatAreMyConnections);
router.post("/user/acceptConnectionRequest", authenticateUser, acceptConnectionRequest);
router.post("/user/rejectConnectionRequest", authenticateUser, rejectConnectionRequest);
router.post("/user/toggleConnectionRequest", authenticateUser, toggleConnectionRequest);
router.get("/user/connectionStatus/:targetUserId", authenticateUser, getConnectionStatus);
router.get("/user/profile/:username", authenticateUser, getUserProfileAndUserBasedOnUsername);

export default router;
