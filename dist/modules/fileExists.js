import { accessSync } from 'fs';
export function fileExists(filePath) {
    try {
        accessSync(filePath);
        return true;
    }
    catch (e) {
        return false;
    }
}
