const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
	{
		// Chat this message belongs to
		chat: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Chat",
			required: true,
		},

		// Message sender
		sender: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},

		// Message content
		content: {
			type: String,
			required: true,
			trim: true,
		},

		// Message type
		type: {
			type: String,
			enum: ["text", "image", "file", "system"],
			default: "text",
		},

		// For file/image messages
		attachments: [
			{
				filename: String,
				url: String,
				mimetype: String,
				size: Number,
			},
		],

		// Message status
		status: {
			type: String,
			enum: ["sent", "delivered", "read"],
			default: "sent",
		},

		// Read receipts
		readBy: [
			{
				user: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
				},
				readAt: {
					type: Date,
					default: Date.now,
				},
			},
		],

		// Message metadata
		isEdited: {
			type: Boolean,
			default: false,
		},
		editedAt: Date,
		isDeleted: {
			type: Boolean,
			default: false,
		},
		deletedAt: Date,
	},
	{
		timestamps: true,
	}
);

// Index for efficient queries
chatMessageSchema.index({ chat: 1, createdAt: -1 });
chatMessageSchema.index({ sender: 1 });
chatMessageSchema.index({ status: 1 });

// Virtual for formatted content (if message is deleted)
chatMessageSchema.virtual("displayContent").get(function () {
	if (this.isDeleted) {
		return "This message was deleted";
	}
	return this.content;
});

// Ensure virtual fields are serialized
chatMessageSchema.set("toJSON", { virtuals: true });

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);

module.exports = ChatMessage;
