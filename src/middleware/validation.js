const validateFileUpload = (req, res, next) => {
    const allowedTypes = req.body.allowedTypes;

    if(allowedTypes) {
        req.allowedTypes = allowedTypes.split(',');
    }

    next();
};

const validateFileType = (req, res, next) => {
    return (req, res, next) => {
        if(req.file && allowedTypes && !allowedTypes.includes(req.file.mimetype)){
            return res.status(400).json({
                error: `File type ${req.file.mimetype} is not allowed. Allowed types are ${allowedTypes.join(', ')}`
            });
        }
        next();
    };
};

module.exports = {
    validateFileUpload,
    validateFileType
};