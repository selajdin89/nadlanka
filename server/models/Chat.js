const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
	{
		// Participants in the chat
		participants: [
			{
				user: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
					required: true,
				},
				joinedAt: {
					type: Date,
					default: Date.now,
				},
				lastReadAt: {
					type: Date,
					default: Date.now,
				},
			},
		],

		// Product being discussed (optional)
		product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
		},

		// Chat metadata
		title: {
			type: String,
			trim: true,
		},
		isActive: {
			type: Boolean,
			default: true,
		},

		// Last message info for quick access
		lastMessage: {
			content: String,
			sender: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
			sentAt: Date,
		},

		// Message count for unread tracking
		messageCount: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	}
);

// Index for efficient queries
chatSchema.index({ participants: 1, createdAt: -1 });
chatSchema.index({ product: 1 });
chatSchema.index({ isActive: 1 });

// Virtual for unread count per user
chatSchema.virtual("unreadCount").get(function () {
	// This will be calculated dynamically based on user's lastReadAt
	return 0; // Will be calculated in the application logic
});

// Ensure virtual fields are serialized
chatSchema.set("toJSON", { virtuals: true });

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
