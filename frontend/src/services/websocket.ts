import { Client } from '@stomp/stompjs';

const SOCKET_URL = 'ws://localhost:8081/ws';

class WebSocketService {
    private client: Client;
    private subscriptions: Map<string, any> = new Map();

    constructor() {
        this.client = new Client({
            brokerURL: SOCKET_URL,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        this.client.onConnect = () => {
            console.log('Connected to WebSocket');
            // Resubscribe if needed
            this.subscriptions.forEach((callback, topic) => {
                this.client.subscribe(topic, (message) => callback(JSON.parse(message.body)));
            });
        };

        this.client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };
    }

    public connect() {
        if (!this.client.active) {
            this.client.activate();
        }
    }

    public disconnect() {
        if (this.client.active) {
            this.client.deactivate();
        }
    }

    public subscribe(topic: string, callback: (data: any) => void) {
        this.subscriptions.set(topic, callback);
        if (this.client.connected) {
            this.client.subscribe(topic, (message) => callback(JSON.parse(message.body)));
        }
    }
}

export const webSocketService = new WebSocketService();
