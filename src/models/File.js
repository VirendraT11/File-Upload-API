class File {
    constructor(data){
        this.id = data.is || Date.now().toString();
        this.originalName = data.originalName;
        this.filename = data.filename;
        this.path = data.path;
        this.size = data.size;
        this.mimetype = data.mimetype;
        this.type = data.type || 'general';
        this.uploadedAt = data.uploadedAt || Date.now().toString();
        this.url = data.url;
        this.isS3 = data.isS3 || false;
    }

    static fromMulterFile(file, type= 'general', isS3 = false){
        return new File({
            originalName: file.originalName,
            filename: file.filename || file.key,
            path: file.path || file.location,
            size: file.size,
            mimetype: file.mimetype,
            type: type,
            url: isS3 ? file.location: `/uploads/${file.filename}`,
            isS3: isS3
        });
    }

    toJSON() {
        return {
            id: this.id,
            originalName: this.originalName,
            filename: this.filename,
            size: this.size,
            mimetype: this.mimetype,
            type: this.type,
            uploadedAt: this.uploadedAt,
            url: this.url,
            isS3: this.isS3
        };
    }
}

module.exports = File;