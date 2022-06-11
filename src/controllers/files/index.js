
const multerS3 = require('multer-s3');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { s3 } = require('../../config/aws');

const BUCKET_NAME = process.env.ALUXION_TEST_AWS_BUCKET_NAME;


// Bajar archivo de Bucket
const downloadFile = async (req, res) => {

    const { file } = req.query;

    try {

        const params = {
            Bucket: BUCKET_NAME,
            Key: file
        };

        let fileCheck;

        // cheque si el archivo existe o hay algun error al leerlo
        try {
            await s3.headObject(params).promise();
            fileCheck = s3.getSignedUrl('getObject', params);
        } catch (error) {
            if (error.name === 'NotFound') {
                console.log("ERROR", error)
                return res.send({
                    Message: "Error al leer el archivo"
                })
            } else {
                console.log("ERROR", error)
                return res.send({
                    Message: "Error al leer el archivo"
                })
            }
        }

        if (fileCheck) {
            // traigo el archivo desde bucket
            const readStream = s3.getObject(params).createReadStream();

            // guardo el archivo en local
            const writeStream = fs.createWriteStream(path.join('./src/public/downloads', file));

            // ejecuto 
            readStream.pipe(writeStream);
        }

        return res.status(200).send({
            Message: "Archivo descargado con exito"
        })

    } catch (error) {
        console.log(error)
        res.status(400).send("Hubo un error!")
    }

};

// Obtener enlace del archivo
const getFileUrl = async (req, res) => {

    const { file } = req.query;

    try {

        const params = {
            Bucket: BUCKET_NAME,
            Key: file
        }

        const url = s3.getSignedUrl('getObject', params);

        return res.status(200).send(url);

    } catch (error) {
        console.log(error)
        res.status(400).send("Hubo un error!")
    }

};

// Cambiar nombre de archivo
const renameFile = async (req, res) => {

    const { file } = req.query;
    const { newName } = req.body;

    try {

        const copyParams = {
            Bucket: BUCKET_NAME,
            CopySource: `/${BUCKET_NAME}/${file}`,
            Key: newName
        };

        const deleteParams = {
            Bucket: BUCKET_NAME,
            Key: file
        }

        // hago una copia con el nuevo nombre
        s3.copyObject(copyParams, (err, data) => {
            if (err) console.log(err, err.stack);
            else console.log(data);
        });

        // borro el elemento con el nombre anterior
        s3.deleteObject(deleteParams, (err, data) => {
            if (err) console.log(err, err.stack);
            else console.log(data);
        });

        return res.status(200).send({
            Message: "Archivo actualizado con exito"
        });


    } catch (error) {
        console.log(error)
        res.status(400).send("Hubo un error!")
    }

};

// Subir archivo a Bucket
const uploadFile = multer({
    storage: multerS3({
        s3: s3,
        bucket: BUCKET_NAME,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + '--' + file.originalname)
        }
    })
});


module.exports = { uploadFile, downloadFile, renameFile, getFileUrl }