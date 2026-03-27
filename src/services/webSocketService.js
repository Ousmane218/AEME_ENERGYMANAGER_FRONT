import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import keycloak from '../Keycloak';

const WS_URL = import.meta.env.VITE_WS_URL;

let stompClient = null;

export const connectWebSocket = (conversationId, onMessageReceived) => {
    stompClient = new Client({
        webSocketFactory: () => new SockJS(WS_URL),
        connectHeaders: {
            Authorization: `Bearer ${keycloak.token}`,
        },
        reconnectDelay: 5000,
        onConnect: () => {
            // S'abonne aux messages de la conversation
            stompClient.subscribe(
                `/topic/conversation.${conversationId}`,
                (message) => {
                    const parsed = JSON.parse(message.body);
                    onMessageReceived(parsed);
                }
            );
        },
        onStompError: (error) => {
            console.error('WebSocket error:', error);
        },
    });

    stompClient.activate();
};

export const sendWebSocketMessage = (conversationId, content) => {
    if (!stompClient || !stompClient.connected) return;
    stompClient.publish({
        destination: '/app/chat.send',
        body: JSON.stringify({ conversationId, content }),
    });
};

export const disconnectWebSocket = () => {
    if (stompClient) {
        stompClient.deactivate();
        stompClient = null;
    }
};