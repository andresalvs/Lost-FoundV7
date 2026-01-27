import { io } from "socket.io-client";

// Centralized singleton Socket.IO client for the app.
// Use this instead of creating io(...) in many components to avoid
// duplicate connections and noisy connect/disconnect cycles.

const SOCKET_URL = "http://localhost:5000";

let socket = null;

export function initSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connect_error:", err);
    });

    socket.on("connect_timeout", (err) => {
      console.warn("Socket connect_timeout:", err);
    });

    // ✅ On connection, join the user's room
    socket.on("connect", () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user?.id) {
          socket.emit("joinUserRoom", user.id);
          console.log(`📍 Joined user room for user ${user.id}`);
        }
      } catch (e) {
        console.warn("Could not join user room:", e);
      }
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (!socket) return;

  try {
    socket.removeAllListeners();
  } catch (err) {
    // Best-effort cleanup; ignore listener removal issues
  }

  socket.disconnect();
  socket = null;
}

export function getActiveSocket() {
  return socket;
}

export default initSocket;
