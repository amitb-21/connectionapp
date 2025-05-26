import mongoose from "mongoose";

const educationSchema = new mongoose.Schema({
    institution: {
        type: String,
        default: "",
    },
    degree: {
        type: String,
        default: "",
    },
    fieldOfStudy: {
        type: String,
        default: "",
    },
    startYear: {
        type: String,
        default: "",
    },
    endYear: {
        type: String,
        default: "",
    }
});

const workSchema = new mongoose.Schema({
    company: {
        type: String,
        default: "",
    },
    position: {
        type: String,
        default: "",
    },
    startYear: {
        type: String,
        default: "",
    },
    endYear: {
        type: String,
        default: "",
    },
    description: {
        type: String,
        default: "",
    }
});

const ProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true  // This already creates an index
    },
    bio: {
        type: String,
        default: "",
        maxlength: 500
    },
    currentPost: {
        type: String,
        default: "",
        maxlength: 100
    },
    experience: {
        type: [workSchema],
        default: []
    },
    education: {
        type: [educationSchema],
        default: []
    },
    skills: {
        type: [String],
        default: []
    },
}, { timestamps: true });

const Profile = mongoose.model("Profile", ProfileSchema);

export default Profile;
