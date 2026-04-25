import { createServer } from "http";
import { Server } from "socket.io";
import {
  startRateLimitCleanup,
  stopRateLimitCleanup,
} from "./lib/rate-limit.js";
import { getRoomTimers, setupConnectionHandlers } from "./socket/handler.js";

const PORT = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ["GET", "POST"],
  },
  transports: ["polling", "websocket"],
  pingInterval: 25000,
  pingTimeout: 20000,
});

setupConnectionHandlers(io);

function gracefulShutdown(signal: string): void {
  console.log("\n" + signal + " received. Shutting down gracefully...");

  stopRateLimitCleanup();

  const roomTimers = getRoomTimers();
  for (const [roomCode, interval] of roomTimers.entries()) {
    clearInterval(interval);
    roomTimers.delete(roomCode);
  }

  io.emit("server:shutdown", { message: "Server restarting" });
  io.disconnectSockets(true);

  httpServer.close(() => {
    console.log("Server shutdown complete");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

startRateLimitCleanup();

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log("WhoIsJudas WebSocket Server");
  console.log(`  Port: ${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`  CORS Origin: ${CORS_ORIGIN}`);
});

export { httpServer, io };
