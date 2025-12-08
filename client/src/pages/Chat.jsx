import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useActiveChat } from "../contexts/ActiveChatContext";
import ChatList from "../components/ChatList";
import ChatRoom from "../components/ChatRoom";
import "./Chat.scss";

const Chat = () => {
	const { user, isAuthenticated } = useAuth();
	const { t } = useLanguage();
	const { setActiveChat, clearActiveChat } = useActiveChat();
	const [selectedChat, setSelectedChat] = useState(null);
	const [showSidebar, setShowSidebar] = useState(true);

	const handleChatSelect = (chat) => {
		setSelectedChat(chat);
		setShowSidebar(false);
		setActiveChat(chat._id);
	};

	const handleBackToList = () => {
		setSelectedChat(null);
		setShowSidebar(true);
		clearActiveChat();
	};

	const handleCreateChat = () => {
		// This will be implemented to show a modal or navigate to product selection
	};

	const handleMessagesRead = () => {
		// This will be used to refresh unread count when messages are read
		// We'll implement this if needed
	};

	if (!isAuthenticated) {
		return (
			<div className="chat-container">
				<div className="chat-login-required">
					<h2>{t("chat.loginRequired") || "Please log in to use chat"}</h2>
					<p>
						{t("chat.loginRequiredDesc") ||
							"You need to be logged in to send and receive messages."}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="chat-page">
			<div className={`chat-sidebar ${showSidebar ? "active" : ""}`}>
				<ChatList
					onChatSelect={handleChatSelect}
					onCreateChat={handleCreateChat}
					onUnreadCountChange={handleMessagesRead}
				/>
			</div>
			<div className="chat-main">
				{selectedChat ? (
					<ChatRoom
						chat={selectedChat}
						onClose={handleBackToList}
						onMessagesRead={handleMessagesRead}
					/>
				) : (
					<div className="chat-empty">
						<h3>
							{t("chat.selectChat") || "Select a chat to start messaging"}
						</h3>
						<p>
							{t("chat.selectChatDesc") ||
								"Choose a conversation from the sidebar to begin chatting."}
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default Chat;
