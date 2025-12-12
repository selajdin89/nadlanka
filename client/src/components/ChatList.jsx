import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useSocket } from "../contexts/SocketContext";
import { MessageCircle, Search, Plus } from "lucide-react";
import "./ChatList.scss";

const ChatList = ({ onChatSelect, onCreateChat, onUnreadCountChange }) => {
	const { user } = useAuth();
	const { t } = useLanguage();
	const { socket } = useSocket();
	const [chats, setChats] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [unreadCount, setUnreadCount] = useState(0);

	useEffect(() => {
		if (user?._id) {
			fetchChats(true); // Show loading on initial load
			fetchUnreadCount();

			// Refresh chat list every 30 seconds to keep it up to date
			const interval = setInterval(() => {
				fetchChats(false); // Don't show loading on refresh
				fetchUnreadCount();
			}, 30000);

			return () => clearInterval(interval);
		}
	}, [user?._id]);

	// Listen for new messages to update chat list in real-time
	useEffect(() => {
		if (!socket || !user?._id) return;

		let refreshTimeout = null;

		const debouncedRefresh = () => {
			if (refreshTimeout) {
				clearTimeout(refreshTimeout);
			}
			refreshTimeout = setTimeout(() => {
				fetchChats(false); // Don't show loading on real-time updates
				fetchUnreadCount();
			}, 500); // 500ms debounce
		};

		const handleNewMessage = (message) => {
			// Debounced refresh to prevent multiple rapid calls
			debouncedRefresh();
		};

		const handleMessageRead = () => {
			// Debounced refresh when messages are marked as read
			debouncedRefresh();
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
	}, [socket, user?._id]);

	const fetchChats = async (showLoading = false) => {
		try {
			if (showLoading) {
				setLoading(true);
			}
			const response = await fetch(`/api/chat/user/${user._id}`, {
				headers: {
					Authorization: `Bearer ${user.token}`,
					"Content-Type": "application/json",
				},
			});
			const data = await response.json();
			setChats(data.chats || []);
		} catch (error) {
			console.error("Error fetching chats:", error);
		} finally {
			if (showLoading) {
				setLoading(false);
			}
		}
	};

	const fetchUnreadCount = async () => {
		if (!user || !user._id || !user.token) {
			setUnreadCount(0);
			return;
		}
		
		try {
			const API_BASE_URL = import.meta.env.VITE_API_URL || "";
			const url = `${API_BASE_URL}/api/chat/user/${user._id}/unread-count`;
			
			const response = await fetch(url, {
				headers: {
					Authorization: `Bearer ${user.token}`,
					"Content-Type": "application/json",
				},
			});
			
			// Check if response is ok and is JSON
			if (!response.ok) {
				// If not ok, don't try to parse as JSON
				if (response.status === 401 || response.status === 403) {
					// User not authenticated or unauthorized - set count to 0
					setUnreadCount(0);
					return;
				}
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			
			// Check if response is actually JSON
			const contentType = response.headers.get("content-type");
			if (!contentType || !contentType.includes("application/json")) {
				console.warn("Response is not JSON, got:", contentType);
				setUnreadCount(0);
				return;
			}
			
			const data = await response.json();
			const newUnreadCount = data.unreadCount || 0;
			setUnreadCount(newUnreadCount);

			// Notify parent component if unread count changed
			if (onUnreadCountChange) {
				onUnreadCountChange(newUnreadCount);
			}
		} catch (error) {
			console.error("Error fetching unread count:", error);
			// Set to 0 on error to avoid showing incorrect count
			setUnreadCount(0);
		}
	};

	const formatTime = (dateString) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInHours = (now - date) / (1000 * 60 * 60);

		if (diffInHours < 24) {
			return date.toLocaleTimeString("mk-MK", {
				hour: "2-digit",
				minute: "2-digit",
			});
		} else if (diffInHours < 168) {
			// 7 days
			return date.toLocaleDateString("mk-MK", { weekday: "short" });
		} else {
			return date.toLocaleDateString("mk-MK", {
				month: "short",
				day: "numeric",
			});
		}
	};

	const getOtherParticipant = (chat) => {
		return chat.participants.find((p) => p.user && p.user._id !== user._id);
	};

	const filteredChats = chats.filter((chat) => {
		if (!searchQuery) return true;

		const otherParticipant = getOtherParticipant(chat);
		const searchLower = searchQuery.toLowerCase();

		return (
			otherParticipant?.user?.name?.toLowerCase().includes(searchLower) ||
			chat.title?.toLowerCase().includes(searchLower) ||
			chat.lastMessage?.content?.toLowerCase().includes(searchLower)
		);
	});

	if (loading) {
		return (
			<div className="chat-list">
				<div className="loading-chats">
					<p>{t("common.loading") || "Loading chats..."}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="chat-list">
			<div className="chat-list-header">
				<h2>{t("chat.title") || "Messages"}</h2>
				{unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
				<button
					className="new-chat-btn"
					onClick={onCreateChat}
					title={t("chat.newChat") || "New Chat"}
				>
					<Plus size={20} />
				</button>
			</div>

			<div className="chat-search">
				<Search size={16} />
				<input
					type="text"
					placeholder={t("chat.search") || "Search chats..."}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
			</div>

			<div className="chats-container">
				{filteredChats.length === 0 ? (
					<div className="no-chats">
						<MessageCircle size={48} />
						<p>{t("chat.noChats") || "No chats found"}</p>
						{searchQuery && (
							<button
								className="clear-search-btn"
								onClick={() => setSearchQuery("")}
							>
								{t("chat.clearSearch") || "Clear search"}
							</button>
						)}
					</div>
				) : (
					filteredChats.map((chat) => {
						const otherParticipant = getOtherParticipant(chat);
						const isUnread = chat.unreadCount > 0;

						return (
							<div
								key={chat._id}
								className={`chat-item ${isUnread ? "unread" : ""}`}
								onClick={() => {
									onChatSelect(chat);
									// Refresh unread count when selecting a chat
									setTimeout(() => fetchUnreadCount(), 200);
								}}
							>
								<div className="chat-avatar">
									{otherParticipant?.user?.name?.charAt(0) || "?"}
								</div>
								<div className="chat-content">
									<div className="chat-header">
										<h3 className="chat-name">
											{otherParticipant?.user?.name || "Unknown User"}
										</h3>
										{chat.lastMessage && (
											<span className="chat-time">
												{formatTime(chat.lastMessage.sentAt)}
											</span>
										)}
									</div>
									<div className="chat-preview">
										<p className="chat-message">
											{chat.lastMessage?.content ||
												t("chat.noMessages") ||
												"No messages yet"}
										</p>
										{isUnread && (
											<span className="unread-indicator">
												{chat.unreadCount}
											</span>
										)}
									</div>
									{chat.product && (
										<div className="chat-product">
											{t("chat.about") || "About"}: {chat.product.title}
										</div>
									)}
								</div>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
};

export default ChatList;
