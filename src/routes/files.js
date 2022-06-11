const { Router } = require('express')
const router = Router()

const { uploadFile, downloadFile, renameFile, getFileUrl } = require('../controllers/files/index');

router.get('/downloadfile', downloadFile);
router.get('/urlfile', getFileUrl);
router.post('/renamefile', renameFile);
router.post('/uploadfile', uploadFile.single('file'), (req, res, next) => {
    const file = req.file
    if (!file) {
        const error = new Error('Error al subir el archivo')
        error.httpStatusCode = 400
        return next(error)
    }
    res.status(200).send({
        Message: "Archivo subido con exito",
        data: file
    })
});


module.exports = router;