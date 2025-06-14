const multer = require('multer');
const path = require('path');
const fs = require('fs');

const localStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = 'uploads/';

        if(req.body.type === 'profile' || req.path.includes('profile')) {
            uploadPath += 'uploads/';
        } else if (req.body.type === 'document' || req.path.includes('document')) {
            uploadPath += 'documents/';
        } else {
            uploadPath += 'general/';
        }

        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },

    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const basename = path.basename(file.originalname, extension);

        cb(null, `${basename}-${uniqueSuffix}${extension}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif','image/webp'];
    const allowedDocumentTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/csv',
        'text/html',
        'text/xml',
        'application/json',
        'application/x-javascript',
        'application/javascript',
        'application/x-httpd-php',
        'application/php',
        'application/x-httpd-php-source',
        'application/x-sh',
        'application/x-shellscript',
        'text/x-php',
        'text/x-shellscript',
        'text/x-c',
        'text/x-csharp',
        'text/x-java-source',
        'text/x-script.perl',
        'text/x-perl',
        'text/x-ruby',
        'image/svg+xml',
        'image/x-xcf',
        'image/x-icon',
        'image/vnd.microsoft.icon',
        'image/x-ms-bmp',
        'image/bmp',
        'video/mpeg',
        'video/mp4',
        'video/quicktime',
        'video/x-msvideo',
        'video/x-ms-wmv',
        'video/x-flv',
        'video/webm',
        'audio/mpeg',
        'audio/mp4',
        'audio/quicktime',
        'audio/x-ms-wma',
        'audio/x-pn-realaudio',
        'audio/x-wav',
        'audio/x-matroska',
        'audio/x-mpegurl',
        'audio/webm',
        'audio/ogg',
        'audio/midi',
        'audio/x-midi',
    ];

    const allAllowedTypes = [...allowedImageTypes, ...allowedDocumentTypes];

    if (allAllowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type ${file.mimetype} is not allowed`), false);
    }
};

const upload = multer({
    storage: localStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 10,
        files: 5
    }    
});

module.exports = {
    upload,
    single: (fieldName) => upload.single(fieldName),
    multiple: (fieldName, maxCount = 5) => upload.array(fieldName, maxCount), 
    fields: (fields) => upload.fields
};