export interface INotificationData {
    title: string;
    message: string;
    data?: any;
    image?: string;
    priority?: 'high' | 'normal';
}