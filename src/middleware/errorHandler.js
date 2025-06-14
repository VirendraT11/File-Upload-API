const multer = require("multer");

const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    if (err instanceof multer.MulterError) {
        if(err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large' });
        }
        if(err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ error: 'Too many files' });
        }
        if(err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ error: 'Unexpected field name' });
        }
    }

    if (err.message.includes('File type') && err.message.includes('not allowed')){
        return res.status(400).json({ error: err.message });
    }

    if (err.code && err.code.startsWith('AWS')) {
        return res.status(500).json({ error: err.message });
    }

    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV == 'development' ? err.message : 'Something went wrong' 
    });
};

module.exports = errorHandler;