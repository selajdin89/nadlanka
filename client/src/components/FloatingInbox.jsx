import React, { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useSocket } from "../contexts/SocketContext";
import { useActiveChat } from "../contexts/ActiveChatContext";
import {
	playNotificationSound,
	showBrowserNotification,
	requestNotificationPermission,
} from "../utils/notifications";
import ChatList from "./ChatList";
import ChatRoom from "./ChatRoom";
import "./FloatingInbox.scss";

const FloatingInbox = () => {
	const { user, isAuthenticated } = useAuth();
	const { t } = useLanguage();
	const { socket } = useSocket();
	const { activeChatId, setActiveChat, clearActiveChat } = useActiveChat();
	const [isOpen, setIsOpen] = useState(false);
	const [unreadCount, setUnreadCount] = useState(0);
	const [selectedChat, setSelectedChat] = useState(null);
	const [showChatList, setShowChatList] = useState(true);

	// Fetch unread count and request notification permission
	useEffect(() => {
		if (isAuthenticated && user?._id) {
			fetchUnreadCount();
			requestNotificationPermission();

			// Refresh unread count every 60 seconds to keep it accurate
			const interval = setInterval(fetchUnreadCount, 60000);
			return () => clearInterval(interval);
		}
	}, [isAuthenticated, user?._id]);

	// Socket.IO event listeners for real-time updates
	useEffect(() => {
		if (!socket || !isAuthenticated) return;

		let refreshTimeout = null;

		const debouncedRefreshUnreadCount = () => {
			if (refreshTimeout) {
				clearTimeout(refreshTimeout);
			}
			refreshTimeout = setTimeout(fetchUnreadCount, 300); // 300ms debounce
		};

		const handleNewMessage = (message) => {
			// Debounced refresh unread count when new message arrives
			debouncedRefreshUnreadCount();

			// Play notification sound and show browser notification
			// Only if the message is not from the current user AND not from the active chat
			if (
				message.sender &&
				message.sender._id !== user._id &&
				message.chat !== activeChatId
			) {
				playNotificationSound();

				// Show browser notification if page is not in focus
				if (document.hidden) {
					showBrowserNotification(
						`New message from ${message.sender.name}`,
						message.content,
						"/favicon.ico"
					);
				}
			}
		};

		const handleMessageRead = () => {
			// Debounced update unread count when messages are read
			debouncedRefreshUnreadCount();
		};

		socket.on("new_message", handleNewMessage);
		socket.on("message_read", handleMessageRead);

		return () => {
			socket.off("new_message", handleNewMessage);
			socket.off("message_read", handleMessageRead);
			if (refreshTimeout) {
				clearTimeout(refreshTimeout);
			}
		};
	}, [socket, isAuthenticated]);

	const fetchUnreadCount = async () => {
		try {
			const response = await fetch(`/api/chat/user/${user._id}/unread-count`, {
				headers: {
					Authorization: `Bearer ${user.token}`,
					"Content-Type": "application/json",
				},
			});
			const data = await response.json();
			setUnreadCount(data.unreadCount || 0);
		} catch (error) {
			console.error("Error fetching unread count:", error);
		}
	};

	const handleInboxClick = () => {
		setIsOpen(!isOpen);
		if (!isOpen) {
			setShowChatList(true);
			setSelectedChat(null);
		}
	};

	const handleChatSelect = (chat) => {
		setSelectedChat(chat);
		setShowChatList(false);
		setActiveChat(chat._id);
	};

	const handleBackToList = () => {
		setSelectedChat(null);
		setShowChatList(true);
		clearActiveChat();
	};

	const handleClose = () => {
		setIsOpen(false);
		setSelectedChat(null);
		setShowChatList(true);
		clearActiveChat();
	};

	if (!isAuthenticated) {
		return null;
	}

	return (
		<>
			{/* Floating Inbox Button */}
			<div className="floating-inbox-container">
				<button
					className={`floating-inbox-btn ${isOpen ? "open" : ""}`}
					onClick={handleInboxClick}
					title={t("chat.title") || "Messages"}
				>
					<MessageCircle size={24} />
					{unreadCount > 0 && (
						<span className="unread-badge">
							{unreadCount > 99 ? "99+" : unreadCount}
						</span>
					)}
				</button>
			</div>

			{/* Inbox Panel */}
			{isOpen && (
				<div className="inbox-panel">
					<div className="inbox-header">
						<h3>{t("chat.title") || "Messages"}</h3>
						<button className="close-btn" onClick={handleClose}>
							<X size={20} />
						</button>
					</div>
					<div className="inbox-content">
						{showChatList ? (
							<ChatList
								onChatSelect={handleChatSelect}
								onCreateChat={() => {
									// Could implement new chat creation here
								}}
								onUnreadCountChange={fetchUnreadCount}
							/>
						) : (
							<ChatRoom
								chat={selectedChat}
								onClose={handleBackToList}
								onMessagesRead={fetchUnreadCount}
							/>
						)}
					</div>
				</div>
			)}
		</>
	);
};

export default FloatingInbox;
