import { resolve } from 'path';
import { promises as fsPromises } from 'fs';
import { addChanges } from '@geut/chan-core';
const { readFile } = fsPromises;
export function updateChangelog(content, changes) {
    let result = content;
    addChanges(content, { changes }, (err, file) => {
        if (err) {
            throw new Error(err);
        }
        result = String(file);
    });
    return result;
}
export function getChangelogContent(dir = process.cwd()) {
    const filePath = resolve(dir, 'CHANGELOG.md');
    return readFile(filePath).then(res => res.toString());
}
