import mongoose from "mongoose";

const connectionRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    connectionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

connectionRequestSchema.index({ userId: 1, status: 1 });
connectionRequestSchema.index({ connectionId: 1, status: 1 });
connectionRequestSchema.index({ userId: 1, connectionId: 1 }, { unique: true });

const ConnectionRequest = mongoose.model("ConnectionRequest", connectionRequestSchema);

export default ConnectionRequest;
