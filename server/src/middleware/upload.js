const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(process.cwd(), 'server', 'uploads'));
  },
  filename(req, file, cb) {
    const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${suffix}-${file.originalname.replace(/\s+/g, '_')}`);
  }
});

const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 3 },
  fileFilter(req, file, cb) {
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only PDF and image files are allowed'));
    }
    return cb(null, true);
  }
});

module.exports = { upload };
