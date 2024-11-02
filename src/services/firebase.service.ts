import { BatchResponse, MulticastMessage, TopicMessage, Message } from 'firebase-admin/messaging';
import admin from 'firebase-admin';
import { firebaseClientCertUrl, firebaseClientEmail, firebaseClientId, firebasePrivateKey, firebasePrivateKeyId, firebaseProjectId, firebaseType } from '@constants/env.constants.js';
import { makeKeyValueString } from '@utils/common.util.js';

export interface NotificationOptions {
    priority?: 'high' | 'normal';
    timeToLive?: number;
    collapseKey?: string;
    mutableContent?: boolean;
    contentAvailable?: boolean;
    customSound?: string;
    badge?: number;
    clickAction?: string;
    color?: string;
}

export class FirebaseService {
    private static instance: FirebaseService;
    private firebase: admin.app.App;
    private readonly DEFAULT_TTL = 24 * 60 * 60; // 24 hours in seconds

    private constructor() {
        const serviceFile = {
            "type": firebaseType,
            "project_id": firebaseProjectId,
            "private_key_id": firebasePrivateKeyId,
            "private_key": firebasePrivateKey?.replace(/\\n/g, '\n'),
            "client_email": firebaseClientEmail,
            "client_id": firebaseClientId,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": firebaseClientCertUrl,
            "universe_domain": "googleapis.com"
        };

        try {
            const existingApp = admin.apps.length ? admin.app() : admin.initializeApp({
                credential: admin.credential?.cert(serviceFile as admin.ServiceAccount),
            });
            this.firebase = existingApp;
        } catch (error) {
            throw new Error(`Failed to initialize Firebase: ${error}`);
        }
    }

    public static getInstance(): FirebaseService {
        if (!FirebaseService.instance) {
            FirebaseService.instance = new FirebaseService();
        }
        return FirebaseService.instance;
    }

    private createBaseMessage(
        title: string,
        body: string,
        data: any = {},
        options: NotificationOptions = {}
    ): Partial<Message> {
        const sanitizedData = makeKeyValueString(data || {});
        return {
            notification: {
                title,
                body,
            },
            data: sanitizedData,
            android: {
                priority: options.priority === 'high' ? 'high' : 'normal',
                ttl: (options.timeToLive || this.DEFAULT_TTL) * 1000, // Convert to milliseconds
                collapseKey: options.collapseKey,
                notification: {
                    sound: options.customSound || 'default',
                    clickAction: options.clickAction,
                    color: options.color,
                },
            },
            apns: {
                headers: {
                    'apns-priority': options.priority === 'high' ? '10' : '5',
                    'apns-expiration': Math.floor(Date.now() / 1000 + (options.timeToLive || this.DEFAULT_TTL)).toString(),
                },
                payload: {
                    aps: {
                        sound: options.customSound || 'default',
                        badge: options.badge,
                        mutableContent: options.mutableContent,
                        contentAvailable: options.contentAvailable,
                    },
                },
            },
        };
    }

    async sendNotification(
        token: string | string[],
        title: string,
        body: string,
        data: any = {},
        image?: string,
        options: NotificationOptions = {}
    ): Promise<BatchResponse> {
        try {
            const baseMessage = this.createBaseMessage(title, body, data, options);
            const message: MulticastMessage = {
                ...baseMessage,
                tokens: Array.isArray(token) ? token : [token],
            } as MulticastMessage;

            if (image) {
                message.notification!.imageUrl = image;
            }

            return await this.firebase.messaging().sendEachForMulticast(message);
        } catch (error) {
            throw new Error(`Failed to send notification: ${error}`);
        }
    }

    async sendToTopic(
        topic: string,
        title: string,
        body: string,
        data: any = {},
        image?: string,
        options: NotificationOptions = {}
    ): Promise<string> {
        try {
            const baseMessage = this.createBaseMessage(title, body, data, options);
            const message: TopicMessage = {
                ...baseMessage,
                topic,
            } as TopicMessage;

            if (image) {
                message.notification!.imageUrl = image;
            }

            return await this.firebase.messaging().send(message);
        } catch (error) {
            throw new Error(`Failed to send topic notification: ${error}`);
        }
    }

    async sendSilentNotification(
        token: string | string[],
        data: any,
        options: NotificationOptions = {}
    ): Promise<BatchResponse> {
        try {
            const sanitizedData = makeKeyValueString(data || {});
            const message: MulticastMessage = {
                data: sanitizedData,
                tokens: Array.isArray(token) ? token : [token],
                android: {
                    priority: options.priority === 'high' ? 'high' : 'normal',
                    ttl: (options.timeToLive || this.DEFAULT_TTL) * 1000,
                },
                apns: {
                    headers: {
                        'apns-priority': options.priority === 'high' ? '10' : '5',
                        'apns-expiration': Math.floor(Date.now() / 1000 + (options.timeToLive || this.DEFAULT_TTL)).toString(),
                    },
                    payload: {
                        aps: {
                            contentAvailable: true
                        }
                    }
                }
            };

            return await this.firebase.messaging().sendEachForMulticast(message);
        } catch (error) {
            throw new Error(`Failed to send silent notification: ${error}`);
        }
    }

    async subscribeToTopic(tokens: string | string[], topic: string): Promise<void> {
        try {
            const tokenArray = Array.isArray(tokens) ? tokens : [tokens];
            await this.firebase.messaging().subscribeToTopic(tokenArray, topic);
        } catch (error) {
            throw new Error(`Failed to subscribe to topic: ${error}`);
        }
    }

    async unsubscribeFromTopic(tokens: string | string[], topic: string): Promise<void> {
        try {
            const tokenArray = Array.isArray(tokens) ? tokens : [tokens];
            await this.firebase.messaging().unsubscribeFromTopic(tokenArray, topic);
        } catch (error) {
            throw new Error(`Failed to unsubscribe from topic: ${error}`);
        }
    }

    async validateRegistrationTokens(tokens: string[]): Promise<{ valid: string[]; invalid: string[]; }> {
        try {
            const response = await this.firebase.messaging().sendEachForMulticast({
                tokens,
                data: { validate: 'true' }
            }, true);

            const valid: string[] = [];
            const invalid: string[] = [];

            response.responses.forEach((resp, index) => {
                if (resp.success) {
                    valid.push(tokens[index]);
                } else {
                    invalid.push(tokens[index]);
                }
            });

            return { valid, invalid };
        } catch (error) {
            throw new Error(`Failed to validate tokens: ${error}`);
        }
    }
}