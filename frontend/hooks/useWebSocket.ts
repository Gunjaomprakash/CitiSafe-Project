import { useEffect, useRef, useState } from 'react';
import { CONFIG } from '@/constants/Config';
import { io, Socket } from 'socket.io-client';

export const useWebSocket = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // Initialize socket connection
        const socket = io(CONFIG.SOCKET_IO_URL, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current = socket;

        // Connection event handlers
        socket.on('connect', () => {
            console.log('Connected to WebSocket server');
            setIsConnected(true);
            setError(null);
        });

        socket.on('connect_error', (err) => {
            console.error('WebSocket connection error:', err);
            setError(`Connection error: ${err.message}`);
            setIsConnected(false);
        });

        socket.on('disconnect', (reason) => {
            console.log('Disconnected from WebSocket server:', reason);
            setIsConnected(false);
        });

        // Cleanup on unmount
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    const sendMessage = (event: string, data: any) => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit(event, data);
        } else {
            console.warn('Cannot send message: WebSocket not connected');
        }
    };

    const subscribe = (event: string, callback: (data: any) => void) => {
        if (socketRef.current) {
            socketRef.current.on(event, callback);
        }
    };

    const unsubscribe = (event: string, callback: (data: any) => void) => {
        if (socketRef.current) {
            socketRef.current.off(event, callback);
        }
    };

    return {
        isConnected,
        error,
        sendMessage,
        subscribe,
        unsubscribe,
    };
}; 