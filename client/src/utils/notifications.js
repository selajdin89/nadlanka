// Simple notification utility for chat messages

let audioContext = null;

// Initialize audio context (required for Web Audio API)
const initAudioContext = () => {
	if (!audioContext) {
		audioContext = new (window.AudioContext || window.webkitAudioContext)();
	}
	return audioContext;
};

// Play notification sound
export const playNotificationSound = () => {
	try {
		const ctx = initAudioContext();

		// Create a simple beep sound
		const oscillator = ctx.createOscillator();
		const gainNode = ctx.createGain();

		oscillator.connect(gainNode);
		gainNode.connect(ctx.destination);

		// Configure the sound
		oscillator.frequency.setValueAtTime(800, ctx.currentTime); // 800 Hz
		oscillator.type = "sine";

		// Volume envelope
		gainNode.gain.setValueAtTime(0, ctx.currentTime);
		gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);
		gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

		// Play the sound
		oscillator.start(ctx.currentTime);
		oscillator.stop(ctx.currentTime + 0.3);
	} catch (error) {
		console.warn("Could not play notification sound:", error);
	}
};

// Show browser notification (if permission granted)
export const showBrowserNotification = (title, body, icon) => {
	if (!("Notification" in window)) {
		console.warn("This browser does not support notifications");
		return;
	}

	if (Notification.permission === "granted") {
		new Notification(title, {
			body,
			icon: icon || "/favicon.ico",
			tag: "chat-notification",
		});
	} else if (Notification.permission !== "denied") {
		Notification.requestPermission().then((permission) => {
			if (permission === "granted") {
				new Notification(title, {
					body,
					icon: icon || "/favicon.ico",
					tag: "chat-notification",
				});
			}
		});
	}
};

// Request notification permission
export const requestNotificationPermission = () => {
	if ("Notification" in window && Notification.permission === "default") {
		return Notification.requestPermission();
	}
	return Promise.resolve(Notification.permission);
};

// Check if notifications are supported and allowed
export const isNotificationSupported = () => {
	return "Notification" in window && Notification.permission === "granted";
};
