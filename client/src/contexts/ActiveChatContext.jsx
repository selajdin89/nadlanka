import React, { createContext, useContext, useState } from "react";

const ActiveChatContext = createContext();

export const useActiveChat = () => {
	const context = useContext(ActiveChatContext);
	if (!context) {
		throw new Error("useActiveChat must be used within an ActiveChatProvider");
	}
	return context;
};

export const ActiveChatProvider = ({ children }) => {
	const [activeChatId, setActiveChatId] = useState(null);

	const setActiveChat = (chatId) => {
		setActiveChatId(chatId);
	};

	const clearActiveChat = () => {
		setActiveChatId(null);
	};

	const value = {
		activeChatId,
		setActiveChat,
		clearActiveChat,
	};

	return (
		<ActiveChatContext.Provider value={value}>
			{children}
		</ActiveChatContext.Provider>
	);
};

export default ActiveChatContext;
