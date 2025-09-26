export const formatValidationError = (errors) => {
    if (!errors || !errors.issues) return "Validation failed";

    if (Array.isArray(errors.issues)) {
        const messages = errors.issues.map((i) => i.message);
        return `Invalid input: ${messages.join(", ")}`;
    }

    return JSON.stringify(errors);
};