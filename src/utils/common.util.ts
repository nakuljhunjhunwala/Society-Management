import puppeteer from "puppeteer";
import Mustache from "mustache";

export function isValidInstance<T>(cls: new () => T, obj: any): obj is T {
    const classInstance = new cls(); // Create an instance of the class to check against

    // Check if the object has all the keys defined in the class instance and correct types
    return Object.keys(classInstance as object).every(key =>
        key in obj && typeof obj[key] === typeof (classInstance as any)[key]
    );
}

export function makeKeyValueString(data: any): any {
    const obj: any = {};
    for (const key in data) {
        const value = data[key];
        if (typeof value === 'object' || Array.isArray(value)) {
            obj[key] = JSON.stringify(value);
        } else if (typeof value === 'number' || typeof value === 'boolean' || value instanceof Date) {
            obj[key] = value.toString();
        } else {
            obj[key] = String(value);
        }
    }
    return obj;
}

export function generateOTP(length: number = 4): string {
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += Math.floor(Math.random() * 10);
    }
    return otp;
}

export async function generatePdf(htmlTemplate: string, data = {}, fileName: string) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const html = Mustache.render(htmlTemplate, data);
    await page.setContent(html);
    const pdf = await page.pdf({ format: 'A4' });
    await browser.close();
    return {
        type: "application/pdf",
        data: pdf,
        filename: `${fileName}.pdf`,
        content: pdf.toString(),
        disposition: "attachment",
    }
}

/**
 * Formats an ISO date string into a more human-readable format for email purposes.
 *
 * @param {string} isoDateString - The ISO date string to format. 
 *                                 Example: "2024-08-31T00:00:00.000Z".
 * 
 * @returns {string} - A formatted date string in the "Month Day, Year" format.
 *                     Example: "August 31, 2024".
 * 
 * @example
 * // Returns "August 31, 2024"
 * formatDateForEmail("2024-08-31T00:00:00.000Z");
 */
export function formatDateForEmail(isoDateString: string | Date): string {

    if (!isoDateString) {
        return ""
    }

    const date = new Date(isoDateString);

    return date.toLocaleDateString('en-US', {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

export function addressToString(address: any): string {
    return `${address.street}, ${address.city}, ${address.state}, ${address.country}, ${address.zip}`;
}