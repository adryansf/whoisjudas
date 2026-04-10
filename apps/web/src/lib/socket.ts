"use client";

import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

function getBrowserSessionId(): string {
	if (typeof window === "undefined") return "";

	let sessionId = localStorage.getItem("browserSessionId");
	if (!sessionId) {
		sessionId = crypto.randomUUID();
		localStorage.setItem("browserSessionId", sessionId);
	}
	return sessionId;
}

export function getSocket(): Socket {
	if (!socket) {
		socket = io({
			path: "/socket.io",
			transports: ["websocket", "polling"],
			auth: {
				browserSessionId: getBrowserSessionId(),
			},
			reconnection: true,
			reconnectionAttempts: 10,
			reconnectionDelay: 1000,
			reconnectionDelayMax: 5000,
			timeout: 20000,
		});
	}
	return socket;
}

export function disconnectSocket(): void {
	if (socket) {
		socket.disconnect();
		socket = null;
	}
}

export function getBrowserSessionIdForClient(): string {
	return getBrowserSessionId();
}
