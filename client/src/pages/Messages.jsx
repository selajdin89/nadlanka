import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import axios from "axios";
import {
	Mail,
	Eye,
	EyeOff,
	Trash2,
	MessageCircle,
	User,
	Calendar,
	Phone,
} from "lucide-react";
import "./Messages.scss";

const Messages = () => {
	const { user, isAuthenticated } = useAuth();
	const { t } = useLanguage();
	const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [unreadCount, setUnreadCount] = useState(0);
	const [selectedMessage, setSelectedMessage] = useState(null);
	const [filter, setFilter] = useState("all"); // all, unread, read, replied

	useEffect(() => {
		if (isAuthenticated && user) {
			fetchMessages();
			fetchUnreadCount();
		}
	}, [isAuthenticated, user, filter]);

	const fetchMessages = async () => {
		try {
			setLoading(true);
			const params = new URLSearchParams();
			if (filter !== "all") {
				params.append("status", filter);
			}

			const response = await axios.get(
				`/api/messages/seller/${user._id}?${params.toString()}`
			);
			setMessages(response.data.messages);
		} catch (error) {
			console.error("Error fetching messages:", error);
			setError("Failed to load messages");
		} finally {
			setLoading(false);
		}
	};

	const fetchUnreadCount = async () => {
		try {
			const response = await axios.get(
				`/api/messages/seller/${user._id}/unread-count`
			);
			setUnreadCount(response.data.unreadCount);
		} catch (error) {
			console.error("Error fetching unread count:", error);
		}
	};

	const markAsRead = async (messageId) => {
		try {
			await axios.patch(`/api/messages/${messageId}/read`);
			// Update local state
			setMessages((prev) =>
				prev.map((msg) =>
					msg._id === messageId
						? { ...msg, status: "read", readAt: new Date() }
						: msg
				)
			);
			setUnreadCount((prev) => Math.max(0, prev - 1));
		} catch (error) {
			console.error("Error marking message as read:", error);
		}
	};

	const markAsReplied = async (messageId) => {
		try {
			await axios.patch(`/api/messages/${messageId}/replied`);
			// Update local state
			setMessages((prev) =>
				prev.map((msg) =>
					msg._id === messageId
						? { ...msg, status: "replied", repliedAt: new Date() }
						: msg
				)
			);
		} catch (error) {
			console.error("Error marking message as replied:", error);
		}
	};

	const deleteMessage = async (messageId) => {
		if (!window.confirm("Are you sure you want to delete this message?")) {
			return;
		}

		try {
			await axios.delete(`/api/messages/${messageId}`);
			setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
			if (selectedMessage?._id === messageId) {
				setSelectedMessage(null);
			}
		} catch (error) {
			console.error("Error deleting message:", error);
			alert("Failed to delete message");
		}
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("mk-MK", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getStatusColor = (status) => {
		switch (status) {
			case "unread":
				return "#ef4444";
			case "read":
				return "#3b82f6";
			case "replied":
				return "#10b981";
			default:
				return "#6b7280";
		}
	};

	const getStatusIcon = (status) => {
		switch (status) {
			case "unread":
				return <EyeOff size={16} />;
			case "read":
				return <Eye size={16} />;
			case "replied":
				return <MessageCircle size={16} />;
			default:
				return <Mail size={16} />;
		}
	};

	if (!isAuthenticated) {
		return (
			<div className="messages-container">
				<div className="error-message">
					<h2>Please log in to view your messages</h2>
				</div>
			</div>
		);
	}

	return (
		<div className="messages-container">
			<div className="messages-header">
				<h1>{t("messages.title") || "Your Messages"}</h1>
				{unreadCount > 0 && (
					<span className="unread-badge">
						{unreadCount} {t("messages.unread") || "unread"}
					</span>
				)}
			</div>

			<div className="messages-content">
				<div className="messages-sidebar">
					<div className="filter-buttons">
						<button
							className={filter === "all" ? "active" : ""}
							onClick={() => setFilter("all")}
						>
							{t("messages.all") || "All Messages"}
						</button>
						<button
							className={filter === "unread" ? "active" : ""}
							onClick={() => setFilter("unread")}
						>
							{t("messages.unread") || "Unread"}
						</button>
						<button
							className={filter === "read" ? "active" : ""}
							onClick={() => setFilter("read")}
						>
							{t("messages.read") || "Read"}
						</button>
						<button
							className={filter === "replied" ? "active" : ""}
							onClick={() => setFilter("replied")}
						>
							{t("messages.replied") || "Replied"}
						</button>
					</div>

					<div className="messages-list">
						{loading ? (
							<div className="loading">
								{t("common.loading") || "Loading messages..."}
							</div>
						) : error ? (
							<div className="error">{error}</div>
						) : messages.length === 0 ? (
							<div className="no-messages">
								<Mail size={48} />
								<p>{t("messages.noMessages") || "No messages found"}</p>
							</div>
						) : (
							messages.map((message) => (
								<div
									key={message._id}
									className={`message-item ${message.status} ${
										selectedMessage?._id === message._id ? "selected" : ""
									}`}
									onClick={() => {
										setSelectedMessage(message);
										if (message.status === "unread") {
											markAsRead(message._id);
										}
									}}
								>
									<div className="message-header">
										<div className="message-sender">
											<User size={16} />
											<span>{message.senderName}</span>
										</div>
										<div
											className="status-indicator"
											style={{ color: getStatusColor(message.status) }}
										>
											{getStatusIcon(message.status)}
										</div>
									</div>
									<div className="message-product">
										{message.product?.title}
									</div>
									<div className="message-preview">
										{message.message.substring(0, 100)}
										{message.message.length > 100 && "..."}
									</div>
									<div className="message-date">
										<Calendar size={12} />
										{formatDate(message.createdAt)}
									</div>
								</div>
							))
						)}
					</div>
				</div>

				<div className="message-detail">
					{selectedMessage ? (
						<div className="message-detail-content">
							<div className="message-detail-header">
								<div className="message-info">
									<h3>{selectedMessage.product?.title}</h3>
									<div className="message-meta">
										<span className="sender">
											<User size={16} />
											{selectedMessage.senderName}
										</span>
										<span className="date">
											<Calendar size={16} />
											{formatDate(selectedMessage.createdAt)}
										</span>
									</div>
								</div>
								<div className="message-actions">
									{selectedMessage.status === "read" && (
										<button
											onClick={() => markAsReplied(selectedMessage._id)}
											className="btn btn-success"
										>
											<MessageCircle size={16} />
											{t("messages.markReplied") || "Mark as Replied"}
										</button>
									)}
									<button
										onClick={() => deleteMessage(selectedMessage._id)}
										className="btn btn-danger"
									>
										<Trash2 size={16} />
										{t("common.delete") || "Delete"}
									</button>
								</div>
							</div>

							<div className="message-detail-body">
								<div className="contact-info">
									<h4>{t("messages.contactInfo") || "Contact Information"}</h4>
									<div className="contact-item">
										<User size={16} />
										<span>{selectedMessage.senderName}</span>
									</div>
									<div className="contact-item">
										<Mail size={16} />
										<a href={`mailto:${selectedMessage.senderEmail}`}>
											{selectedMessage.senderEmail}
										</a>
									</div>
									<div className="contact-item">
										<MessageCircle size={16} />
										<span>
											{t("messages.preferredContact") || "Preferred Contact"}:{" "}
											{selectedMessage.preferredContactMethod}
										</span>
									</div>
								</div>

								<div className="message-content">
									<h4>{t("messages.message") || "Message"}</h4>
									<div className="message-text">
										{selectedMessage.message.split("\n").map((line, index) => (
											<p key={index}>{line}</p>
										))}
									</div>
								</div>

								<div className="reply-section">
									<h4>{t("messages.reply") || "Reply"}</h4>
									<p className="reply-instruction">
										{t("messages.replyInstruction") ||
											"Reply directly to this email address to contact the buyer."}
									</p>
									<a
										href={`mailto:${selectedMessage.senderEmail}?subject=Re: ${selectedMessage.product?.title}`}
										className="btn btn-primary"
									>
										<Mail size={16} />
										{t("messages.replyEmail") || "Reply via Email"}
									</a>
								</div>
							</div>
						</div>
					) : (
						<div className="no-selection">
							<MessageCircle size={64} />
							<p>
								{t("messages.selectMessage") ||
									"Select a message to view details"}
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Messages;
