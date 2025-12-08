const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
	{
		// Sender information (the person contacting the seller)
		senderName: {
			type: String,
			required: true,
			trim: true,
		},
		senderEmail: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
		},

		// Seller information (the product owner)
		seller: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},

		// Product information
		product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
			required: true,
		},

		// Message content
		subject: {
			type: String,
			required: true,
			trim: true,
		},
		message: {
			type: String,
			required: true,
			trim: true,
		},

		// Message status
		status: {
			type: String,
			enum: ["unread", "read", "replied"],
			default: "unread",
		},

		// Contact preferences
		preferredContactMethod: {
			type: String,
			enum: ["email", "phone", "both"],
			default: "email",
		},

		// Timestamps
		readAt: {
			type: Date,
		},
		repliedAt: {
			type: Date,
		},
	},
	{
		timestamps: true,
	}
);

// Index for efficient queries
messageSchema.index({ seller: 1, createdAt: -1 });
messageSchema.index({ product: 1 });
messageSchema.index({ status: 1 });

// Virtual for unread count
messageSchema.virtual("isUnread").get(function () {
	return this.status === "unread";
});

// Ensure virtual fields are serialized
messageSchema.set("toJSON", { virtuals: true });

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
