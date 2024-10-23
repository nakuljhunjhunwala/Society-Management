export function isValidInstance<T>(cls: new () => T, obj: any): obj is T {
    const classInstance = new cls(); // Create an instance of the class to check against

    // Check if the object has all the keys defined in the class instance and correct types
    return Object.keys(classInstance as object).every(key =>
        key in obj && typeof obj[key] === typeof (classInstance as any)[key]
    );
}