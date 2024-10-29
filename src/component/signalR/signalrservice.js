// src/signalRService.js
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { notification } from 'antd';


class SignalRService {
    constructor() {
        this.connection = new HubConnectionBuilder()
            .withUrl('http://koishipping.somee.com/orderHub') // Adjust the URL as necessary
            .withAutomaticReconnect()
            // .configureLogging(LogLevel.Information)
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

    onOrderDetailCreated() {
        this.connection.on('ReceiveOrderNotification', (message) => {
            notification.open({
                message: 'Thông báo',
                description: message,
                showProgress: true,
                pauseOnHover: true,
            });
        });
    }
}

export default new SignalRService();

