import { BatchResponse, MulticastMessage, TopicMessage } from 'firebase-admin/messaging';
import admin from 'firebase-admin';
import { firebaseClientCertUrl, firebaseClientEmail, firebaseClientId, firebasePrivateKey, firebasePrivateKeyId, firebaseProjectId, firebaseType } from '@constants/env.constants.js';
import { makeKeyValueString } from '@utils/common.util.js';

export class FirebaseService {
    private static instance: FirebaseService;
    private firebase: admin.app.App;

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

        const existingApp = admin.apps.length ? admin.app() : admin.initializeApp({
            credential: admin.credential?.cert(serviceFile as admin.ServiceAccount),
        });

        this.firebase = existingApp;
    }

    public static getInstance(): FirebaseService {
        if (!FirebaseService.instance) {
            FirebaseService.instance = new FirebaseService();
        }

        return FirebaseService.instance;
    }

    async sendNotification(token: string | string[], title: string, body: string, data: any = {}, image?: string): Promise<BatchResponse> {
        const sanitizedData = makeKeyValueString(data || {});
        const message: MulticastMessage = {
            notification: {
                title,
                body,
            },
            data: sanitizedData,
            tokens: Array.isArray(token) ? token : [token],
            apns: {
                payload: {
                    aps: {
                        sound: 'default',
                        contentAvailable: true
                    },
                },
            },
            android: {
                notification: {
                    sound: 'default',
                },
            },
        }

        if (image) {
            message!.notification!.imageUrl = image;
        }


        return this.firebase.messaging().sendEachForMulticast(message);
    }

    async sendToTopic(topic: string, title: string, body: string, data: any, image?: string): Promise<string> {
        const sanitizedData = makeKeyValueString(data || {});
        const message: TopicMessage = {
            topic,
            notification: {
                title,
                body,
            },
            data: sanitizedData,
            apns: {
                payload: {
                    aps: {
                        sound: 'default',
                    },
                },
            },
            android: {
                notification: {
                    sound: 'default',
                },
            },
        }

        if (image) {
            message!.notification!.imageUrl = image;
        }

        return this.firebase.messaging().send(message);
    }

    async sendSilentNotification(token: string | string[], data: any): Promise<BatchResponse> {
        const sanitizedData = makeKeyValueString(data || {});
        const message: MulticastMessage = {
            data: sanitizedData,
            tokens: Array.isArray(token) ? token : [token],
            apns: {
                payload: {
                    aps: {
                        contentAvailable: true
                    }
                }
            }
        }

        return this.firebase.messaging().sendEachForMulticast(message);
    }



}
