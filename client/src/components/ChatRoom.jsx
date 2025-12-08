import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../contexts/SocketContext";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { Send, ArrowLeft, Phone, Video, MoreVertical } from "lucide-react";
import "./ChatRoom.scss";

const ChatRoom = ({ chat, onClose, onMessagesRead }) => {
	const { socket } = useSocket();
	const { user } = useAuth();
	const { t } = useLanguage();
	const [messages, setMessages] = useState([]);
	const [newMessage, setNewMessage] = useState("");
	const [loading, setLoading] = useState(true);
	const [typingUsers, setTypingUsers] = useState([]);
	const messagesEndRef = useRef(null);
	const typingTimeoutRef = useRef(null);

	// Scroll to bottom of messages
	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	// Load chat messages and mark as read
	useEffect(() => {
		if (chat?._id) {
			loadMessages();
			joinChat();
		}

		return () => {
			if (chat?._id && socket) {
				socket.emit("leave_chat", chat._id);
			}
		};
	}, [chat?._id]);

	// Mark messages as read when chat is opened
	useEffect(() => {
		if (chat?._id && socket && !loading) {
			// Small delay to ensure messages are loaded
			const timer = setTimeout(() => {
				socket.emit("mark_as_read", chat._id);
				if (onMessagesRead) {
					onMessagesRead();
				}
			}, 100);

			return () => clearTimeout(timer);
		}
	}, [chat?._id, socket, loading, onMessagesRead]);

	// Socket event listeners
	useEffect(() => {
		if (!socket) return;

		const handleNewMessage = (message) => {
			setMessages((prev) => [...prev, message]);
			scrollToBottom();
		};

		const handleUserTyping = (data) => {
			setTypingUsers((prev) => {
				if (data.isTyping) {
					return [...prev.filter((u) => u.userId !== data.userId), data];
				} else {
					return prev.filter((u) => u.userId !== data.userId);
				}
			});
		};

		const handleError = (error) => {
			console.error("Chat error:", error);
		};

		socket.on("new_message", handleNewMessage);
		socket.on("user_typing", handleUserTyping);
		socket.on("error", handleError);

		return () => {
			socket.off("new_message", handleNewMessage);
			socket.off("user_typing", handleUserTyping);
			socket.off("error", handleError);
		};
	}, [socket]);

	// Scroll to bottom when messages change
	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const loadMessages = async () => {
		try {
			setLoading(true);
			const response = await fetch(`/api/chat/${chat._id}/messages`, {
				headers: {
					Authorization: `Bearer ${user.token}`,
					"Content-Type": "application/json",
				},
			});
			const data = await response.json();
			setMessages(data.messages || []);

			// Mark messages as read immediately after loading
			if (socket && chat._id) {
				socket.emit("mark_as_read", chat._id);
			}

			// Notify parent component to refresh unread count
			if (onMessagesRead) {
				onMessagesRead();
			}
		} catch (error) {
			console.error("Error loading messages:", error);
		} finally {
			setLoading(false);
		}
	};

	const joinChat = () => {
		if (socket && chat._id) {
			socket.emit("join_chat", chat._id);
			// Mark messages as read when joining chat
			socket.emit("mark_as_read", chat._id);
		}
	};

	const sendMessage = () => {
		if (!newMessage.trim() || !socket || !chat._id) return;

		socket.emit("send_message", {
			chatId: chat._id,
			content: newMessage.trim(),
			type: "text",
		});

		setNewMessage("");
		stopTyping();
	};

	const handleKeyPress = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	const handleInputChange = (e) => {
		setNewMessage(e.target.value);

		// Handle typing indicators
		if (socket && chat._id) {
			socket.emit("typing", { chatId: chat._id, isTyping: true });

			// Clear existing timeout
			if (typingTimeoutRef.current) {
				clearTimeout(typingTimeoutRef.current);
			}

			// Set new timeout to stop typing
			typingTimeoutRef.current = setTimeout(() => {
				socket.emit("typing", { chatId: chat._id, isTyping: false });
			}, 1000);
		}
	};

	const stopTyping = () => {
		if (socket && chat._id) {
			socket.emit("typing", { chatId: chat._id, isTyping: false });
		}
	};

	const formatTime = (dateString) => {
		return new Date(dateString).toLocaleTimeString("mk-MK", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("mk-MK", {
			month: "short",
			day: "numeric",
		});
	};

	const getOtherParticipant = () => {
		return chat?.participants?.find((p) => p.user && p.user._id !== user._id);
	};

	const otherParticipant = getOtherParticipant();

	if (!chat) {
		return (
			<div className="chat-room">
				<div className="chat-empty">
					<p>{t("chat.selectChat") || "Select a chat to start messaging"}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="chat-room">
			{/* Chat Header */}
			<div className="chat-header">
				<div className="chat-header-left">
					<button className="back-btn" onClick={onClose}>
						<ArrowLeft size={20} />
					</button>
					<div className="participant-info">
						<div className="participant-avatar">
							{otherParticipant?.user?.name?.charAt(0) || "?"}
						</div>
						<div className="participant-details">
							<h3>{otherParticipant?.user?.name || "Unknown User"}</h3>
							{chat.product && (
								<p className="product-info">
									{t("chat.about") || "About"}: {chat.product.title}
								</p>
							)}
						</div>
					</div>
				</div>
				<div className="chat-header-actions">
					<button className="action-btn">
						<Phone size={20} />
					</button>
					<button className="action-btn">
						<Video size={20} />
					</button>
					<button className="action-btn">
						<MoreVertical size={20} />
					</button>
				</div>
			</div>

			{/* Messages Area */}
			<div className="messages-area">
				{loading ? (
					<div className="loading-messages">
						<p>{t("common.loading") || "Loading messages..."}</p>
					</div>
				) : (
					<div className="messages-list">
						{messages.map((message, index) => {
							const isOwn = message.sender && message.sender._id === user._id;
							const prevMessage = messages[index - 1];
							const showAvatar =
								!prevMessage ||
								!prevMessage.sender ||
								prevMessage.sender._id !== message.sender._id;
							const showDate =
								!prevMessage ||
								new Date(message.createdAt).toDateString() !==
									new Date(prevMessage.createdAt).toDateString();

							return (
								<div key={message._id}>
									{showDate && (
										<div className="date-separator">
											{formatDate(message.createdAt)}
										</div>
									)}
									<div className={`message ${isOwn ? "own" : "other"}`}>
										{!isOwn && showAvatar && (
											<div className="message-avatar">
												{message.sender.name?.charAt(0) || "?"}
											</div>
										)}
										<div className="message-content">
											{!isOwn && showAvatar && (
												<div className="message-sender">
													{message.sender.name}
												</div>
											)}
											<div className="message-bubble">
												<p>{message.content}</p>
												<span className="message-time">
													{formatTime(message.createdAt)}
												</span>
											</div>
										</div>
									</div>
								</div>
							);
						})}

						{/* Typing Indicator */}
						{typingUsers.length > 0 && (
							<div className="typing-indicator">
								<div className="typing-dots">
									<span></span>
									<span></span>
									<span></span>
								</div>
								<span className="typing-text">
									{typingUsers.map((u) => u.userName).join(", ")}{" "}
									{t("chat.typing") || "is typing..."}
								</span>
							</div>
						)}

						<div ref={messagesEndRef} />
					</div>
				)}
			</div>

			{/* Message Input */}
			<div className="message-input">
				<input
					type="text"
					value={newMessage}
					onChange={handleInputChange}
					onKeyPress={handleKeyPress}
					placeholder={t("chat.typeMessage") || "Type a message..."}
					className="message-field"
				/>
				<button
					onClick={sendMessage}
					disabled={!newMessage.trim()}
					className="send-btn"
				>
					<Send size={20} />
				</button>
			</div>
		</div>
	);
};

export default ChatRoom;
