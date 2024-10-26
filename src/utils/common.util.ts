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