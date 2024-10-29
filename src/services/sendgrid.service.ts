import { emailFromAddress } from '@constants/common.constants.js';
import { sendgridApiKey } from '@constants/env.constants.js';
import sgmail from '@sendgrid/mail';

export class EmailService {
    static instance: EmailService;
    private key: string = sendgridApiKey || '';

    private constructor() {
        sgmail.setApiKey(this.key);
    }

    static getInstance(): EmailService {
        if (!this.instance) {
            this.instance = new EmailService();
        }
        return this.instance;
    }

    async sendEmailViaTemplate(to: string, templateId: string, dynamicTemplateData: {}) {
        try {
            const msg = {
                to,
                from: emailFromAddress.default,
                templateId,
                dynamicTemplateData
            }

            await sgmail.send(msg);
        } catch (error) {
            throw error;
        }
    }

    async sendEmailWithAttachmentAndTemplate(to: string, templateId: string, dynamicTemplateData: {}, attachment: any) {
        try {
            const msg = {
                to,
                from: emailFromAddress.default,
                templateId,
                dynamicTemplateData,
                attachments: [attachment]
            }

            await sgmail.send(msg);
        } catch (error) {
            throw error;
        }
    }
}