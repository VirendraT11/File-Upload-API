const path  = require('path');
const fs = require('fs');

class Fileutils { 
    static getFileExtension(fileName) {
        return path.extname(fileName).toLowerCase();
    }

    static isImageFile(mimetype) {
        return mimetype.startsWith('image/');
    }

    static isDocumentFile(mimetype) {
        const documentTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.oasis.opendocument.text',
            'application/vnd.oasis.opendocument.spreadsheet',
            'application/vnd.oasis.opendocument.presentation',
            'text/plain',
            'text/csv',
            'text/html',
            'text/xml',
            'application/xml',
            'application/json',
            'application/javascript',
            'application/x-javascript',
            'application/ecmascript',
            'text/ecmascript',
            'text/javascript',
            'text/x-javascript',
            'text/x-json',
            'text/x-c++src',
            'text/x-c++hdr',
            'text/x-chdr',
            'text/cache-manifest',
            'image/gif',
            'image/jpeg',
            'image/png',
            'image/tiff',
            'image/vnd.microsoft.icon',
            'image/x-icon',
            'image/svg+xml',
        ]

        return documentTypes.includes(mimetype);
    }

    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    static sanitizeFilename(filename) {
        return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    }

    static ensureDirectoryExists(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, {
                recursive: true
            });
        }
    } 
}

module.exports = Fileutils;