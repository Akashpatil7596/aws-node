import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "fs";
import { v4 as uuidv4 } from "uuid";
import { extname } from "path";
import { STORAGE_PATH } from "./constants.js";

export const uploadFile = (dir, file) => {
    const storageDirExists = existsSync(STORAGE_PATH);
    if (!storageDirExists) {
        mkdirSync(STORAGE_PATH);
    }

    const randomName = uuidv4();

    const fileName = `${dir}/${randomName}${extname(file.name)}`;

    const exists = existsSync(`${STORAGE_PATH}/${dir}`);
    if (!exists) {
        mkdirSync(`${STORAGE_PATH}/${dir}`);
    }
    writeFileSync(`${STORAGE_PATH}/${fileName}`, file.data);

    return fileName;
};

export const removeFile = (file) => {
    const storageDirExists = existsSync(STORAGE_PATH);
    if (!storageDirExists) {
        mkdirSync(STORAGE_PATH);
    }

    if (file) {
        unlinkSync(`${STORAGE_PATH}/${file}`);
    }
};
