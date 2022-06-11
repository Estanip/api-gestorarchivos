const multer = require('multer')

// Multer
// seteo el almacenamiento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '.public/uploads');
    },
    filename: function (req, file, cb) {
        let extension = file.originalname.split('.');
        let cleanExt = extension[extension.length - 1];
        cb(null, new Date().getTime() + '.' + cleanExt);
    },
});

// local
const upload = multer({ storage: storage });

module.exports = upload;