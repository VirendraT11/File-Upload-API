const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();

const s3Storage = multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET,
    acl: 'public-read',
    key: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const basename = path.basename(file.originalname, extension);

        let folder = 'general/';
        if(req.body.type === 'profile' || req.path.includes('profile')){
            folder = 'profile/';
        } else if (req.body.type === 'document' || req.path.includes('document')){
            folder = 'document/';
        }
        cb(null, `${folder}${basename}-${uniqueSuffix}${extension}`);
    }
});

const s3Upload = multer({
    storage: s3Storage,
    limits: {
        fileSize: 1024 * 1024 * 10,
        files: 5
    }
});

module.exports = {
    s3,
    s3Upload,
    s3Single: (fieldname) => s3Upload.single(fieldname),
    s3Multiple: (fieldname, maxCount = 5) => s3Upload.array(fieldname, maxCount)
};