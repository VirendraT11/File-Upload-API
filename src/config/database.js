const fs = require("fs");
const path = require("path");

class Database {
  constructor() {
    this.dbPath = path.join(__dirname, "../../uploads/database.json");
    this.filesPath = path.join(__dirname, "../../uploads/files.json");
    this.usersPath = path.join(__dirname, "../../uploads/users.json");

    this.initializedDatabase();
  }

  initializedDatabase() {
    if (!fs.existsSync(this.dbPath)) {
      fs.mkdirSync(this.dbPath, { recursive: true });
    }

    if (!fs.existsSync(this.filesPath)) {
      this.writeFiles([]);
    }

    if (!fs.existsSync(this.usersPath)) {
      this.writeUsers([
        {
          id: 1,
          email: "admin@example.com",
          password: "admin",
          role: "admin",
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          email: "user@example.com",
          password: "user",
          role: "user",
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  }

  readFiles(files) {
    try {
      fs.writeFileSync(this.filesPath, JSON.stringify(files, null, 2));
      return JSON.parse(data);
    } catch (error) {
      console.error("Error reading files:", error);
      return [];
    }
  }

  writeFiles(files) {
    try {
      fs.writeFileSync(this.filesPath, JSON.stringify(files, null, 2));
      return true;
    } catch (error) {
      console.error("Error writing files:", error);
      return false;
    }
  }

  addFile(file) {
    const files = this.readFiles();
    files.push(file);
    return this.writeFiles(files);
  }

  updateFile(id, updates) {
    const files = this.readFiles();
    const index = files.findIndex((file) => file.id == id);

    if (index !== -1) {
      files[index] = { ...files[index], ...updates };
      return this.writeFiles(files) ? files[index] : null;
    }
    return null;
  }

  deleteFile(id) {
    const files = this.readFiles();
    const index = files.findIndex((f) => f.id === id);

    if (index !== -1) {
      const deletedFile = files.splice(index, 1)[0];
      return this.writeFiles(files) ? deletedFile : null;
    }
    return null;
  }

  getFileById(id) {
    const files = this.readFiles();
    return files.find((f) => f.id === id);
  }

  getFilesByType(type) {
    const files = this.readFiles();
    return files.filter((f) => f.type === type);
  }

  getFilesByUser(userId) {
    const files = this.readFiles();
    return files.filter((f) => f.uploadedBy === userId);
  }

  readUsers() {
    try {
      const data = fs.readFileSync(this.usersPath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Error reading users:", error);
      return [];
    }
  }

  writeUsers(users) {
    try {
      fs.writeFileSync(this.usersPath, JSON.stringify(users, null, 2));
      return true;
    } catch (error) {
      console.error("Error writing users:", error);
      return false;
    }
  }

  getUserByEmail(email) {
    const users = this.readUsers();
    return users.find((u) => u.email === email);
  }

  getUserById(id) {
    const users = this.readUsers();
    return users.find((u) => u.id === id);
  }

  addUser(user) {
    const users = this.readUsers();
    const newUser = {
      id: Date.now(),
      ...user,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    return this.writeUsers(users) ? newUser : null;
  }

  getFileStats() {
    const files = this.readFiles();
    return {
      totalFiles: files.length,
      totalSize: files.reduce((sum, file) => sum + (file.size || 0), 0),
      filesByType: files.reduce((acc, file) => {
        acc[file.type] = (acc[file.type] || 0) + 1;
        return acc;
      }, {}),
      filesByMimetype: files.reduce((acc, file) => {
        acc[file.mimetype] = (acc[file.mimetype] || 0) + 1;
        return acc;
      }, {}),
      recentUploads: files
        .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
        .slice(0, 10),
    };
  }

  paginateFiles(page = 1, limit = 10, filters = {}) {
    let files = this.readFiles();

    if(filters.type) {
        files = files.filter(f => f.type === filters.type);
    }
    if(filters.mimetype) {
        files = files.filter(f => f.mimetype === filters.mimetype);
    }
    if (filters.uploadedBy) {
        files = files.filter(f => f.uploadedBy === filters.uploadedBy);
    }

    files.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedFiles = files.slice(startIndex, endIndex);

    return {
        files: paginatedFiles,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(files.length / limit),
            totalFiles: files.length,
            hasNext: endIndex < files.length,
            hasPrevious: startIndex > 0,
            limit: parseInt(limit)
        }
    };
  } 
}

const database = new Database();

module.exports = database;