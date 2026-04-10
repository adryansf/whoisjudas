"use client";

import { useCallback, useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import { getSocket } from "@/lib/socket";

const EMIT_TIMEOUT = 15000;

export function useSocket() {
	const [isConnected, setIsConnected] = useState(false);
	const [socket, setSocket] = useState<Socket | null>(null);
	const [kickedReason, setKickedReason] = useState<string | null>(null);
	const [multipleSessionsReason, setMultipleSessionsReason] = useState<
		string | null
	>(null);
	const [connectionError, setConnectionError] = useState<string | null>(null);

	useEffect(() => {
		const s = getSocket();
		setSocket(s);

		const onConnect = () => {
			setIsConnected(true);
			setConnectionError(null);
		};
		const onDisconnect = () => setIsConnected(false);
		const onConnectError = (err: Error) => {
			setConnectionError(err.message);
			setIsConnected(false);
		};
		const onKicked = (data: { reason: string }) => {
			setKickedReason(data.reason);
			localStorage.removeItem("playerId");
		};
		const onMultipleSessions = (data: { reason: string }) => {
			setMultipleSessionsReason(data.reason);
		};

		s.on("connect", onConnect);
		s.on("disconnect", onDisconnect);
		s.on("connect_error", onConnectError);
		s.on("kicked", onKicked);
		s.on("multiple-sessions", onMultipleSessions);

		if (s.connected) {
			setIsConnected(true);
		}

		return () => {
			s.off("connect", onConnect);
			s.off("disconnect", onDisconnect);
			s.off("connect_error", onConnectError);
			s.off("kicked", onKicked);
			s.off("multiple-sessions", onMultipleSessions);
		};
	}, []);

	const emit = useCallback(
		<T, R>(event: string, data: T): Promise<R> => {
			return new Promise((resolve, reject) => {
				if (!socket) {
					reject(new Error("Socket not connected"));
					return;
				}

				const timeout = setTimeout(() => {
					reject(new Error("Request timed out"));
				}, EMIT_TIMEOUT);

				socket.emit(event, data, (response: R) => {
					clearTimeout(timeout);
					resolve(response);
				});
			});
		},
		[socket],
	);

	const on = useCallback(
		<T>(event: string, handler: (data: T) => void) => {
			if (socket) {
				socket.on(event, handler);
			}
			return () => {
				if (socket) {
					socket.off(event, handler);
				}
			};
		},
		[socket],
	);

	const clearKicked = useCallback(() => {
		setKickedReason(null);
	}, []);

	const clearMultipleSessions = useCallback(() => {
		setMultipleSessionsReason(null);
	}, []);

	const clearError = useCallback(() => {
		setConnectionError(null);
	}, []);

	return {
		isConnected,
		socket,
		emit,
		on,
		kickedReason,
		clearKicked,
		multipleSessionsReason,
		clearMultipleSessions,
		connectionError,
		clearError,
	};
}
