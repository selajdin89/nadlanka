import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const useSocket = () => {
	const context = useContext(SocketContext);
	if (!context) {
		throw new Error("useSocket must be used within a SocketProvider");
	}
	return context;
};

export const SocketProvider = ({ children }) => {
	const { user, isAuthenticated } = useAuth();
	const [socket, setSocket] = useState(null);
	const [isConnected, setIsConnected] = useState(false);

	useEffect(() => {
		if (isAuthenticated && user?.token) {
			// Initialize socket connection
			const newSocket = io(window.location.origin.replace("3000", "5000"), {
				auth: {
					token: user.token,
				},
				autoConnect: true,
			});

			// Connection event handlers
			newSocket.on("connect", () => {
				console.log("✅ Connected to chat server");
				setIsConnected(true);
			});

			newSocket.on("disconnect", () => {
				console.log("❌ Disconnected from chat server");
				setIsConnected(false);
			});

			newSocket.on("error", (error) => {
				console.error("Socket error:", error);
			});

			setSocket(newSocket);

			// Cleanup on unmount
			return () => {
				newSocket.close();
			};
		} else {
			// Disconnect socket if user logs out
			if (socket) {
				socket.close();
				setSocket(null);
				setIsConnected(false);
			}
		}
	}, [isAuthenticated, user?.token]);

	const value = {
		socket,
		isConnected,
	};

	return (
		<SocketContext.Provider value={value}>{children}</SocketContext.Provider>
	);
};
