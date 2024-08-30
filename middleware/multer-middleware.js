const multer = require('multer');
const storage = multer.memoryStorage(); // Store file in memory temporarily
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|doc|docx/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(file.originalname.split('.').pop());

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only .pdf, .doc, .docx files are allowed.'));
        }
    }
});

module.exports = upload;
