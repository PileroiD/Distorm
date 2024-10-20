"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useEffect, useState } from "react";
import { socket } from "../../socket";
import { DefaultEventsMap, Socket } from "socket.io";

type SocketContextType = {
    socket: Socket<DefaultEventsMap, DefaultEventsMap> | null;
    isConnected: boolean;
    transport: string;
};

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    transport: "",
});

export const useSocket = () => useContext(SocketContext);

export default function SocketProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isConnected, setIsConnected] = useState(false);
    const [transport, setTransport] = useState("N/A");

    useEffect(() => {
        if (socket.connected) {
            onConnect();
        }

        function onConnect() {
            setIsConnected(true);
            setTransport(socket.io.engine.transport.name);

            socket.io.engine.on("upgrade", (transport) => {
                setTransport(transport.name);
            });
        }

        function onDisconnect() {
            setIsConnected(false);
            setTransport("N/A");
        }

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected, transport }}>
            {children}
        </SocketContext.Provider>
    );
}
