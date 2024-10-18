// src/signalRService.js
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { notification } from 'antd';


class SignalRService {
    constructor() {
        this.connection = new HubConnectionBuilder()
            .withUrl('https://localhost:7167/orderHub') // Adjust the URL as necessary
            // .withAutomaticReconnect()
            .configureLogging(LogLevel.Information)
            .build();
    }

    async start() {
        try {
            await this.connection.start();
            console.log('SignalR Connected.');
        } catch (err) {
            console.error('Error while starting SignalR connection: ', err);
        }
    }

    onOrderDetailCreated(callback) {
        this.connection.on('ReceiveOrderNotification', (message) => {
            console.log('ReceiveOrderNotification', message);
            notification.open({
                message: 'Thông báo',
                description: message,
                duration: 5000,
            });
        });
    }
}

export default new SignalRService();

