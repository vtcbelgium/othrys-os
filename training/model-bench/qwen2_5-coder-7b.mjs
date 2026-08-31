export function normalizeText(input) {
    if (input == null) {
        return '';
    }
    input = String(input);
    input = input.replace(/\r\n|\r/g, '\n');
    input = input.replace(/\s+/g, ' ');
    input = input.replace(/ +$/gm, '');
    input = input.replace(/\n\n+/g, '\n\n');
    return input.trim();
}