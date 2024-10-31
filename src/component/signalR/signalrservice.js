// src/signalRService.js
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { notification } from 'antd';


class SignalRService {
    constructor() {
        this.connection = new HubConnectionBuilder()
            .withUrl('https://tadnuat-001-site1.dtempurl.com/orderHub') // Adjust the URL as necessary
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

    onOrderDetailCreated(callback) {
        this.connection.on('ReceiveOrderNotification', (message) => {
            console.log("Message: ", message);
            callback(message);
        });
    }
}

export default new SignalRService();

