import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "https://sahayatri-p95g.onrender.com";

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: false,
    });
  }

  return socket;
}

export function connectSocket(accessToken: string) {
  const currentSocket = getSocket();

  currentSocket.auth = {
    token: accessToken,
  };

  if (!currentSocket.connected) {
    currentSocket.connect();
  }

  return currentSocket;
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
}