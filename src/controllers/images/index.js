const got = (...args) => import('got').then(({ default: got }) => got(...args));

const unsplash = require('../../config/unsplash');
const { s3 } = require('../../config/aws');

const BUCKET_NAME = process.env.ALUXION_TEST_AWS_BUCKET_NAME;

// Buscar una imegen por filtros
const getImagesBy = async (req, res) => {

    const { type, page, orderBy } = req.query

    try {

        let filters = {}

        if (type) {
            filters = { ...filters, query: type }
        }

        if (page) {
            filters = { ...filters, page: page }
        }

        if (orderBy) {
            filters = { ...filters, orderBy: orderBy }
        }

        const { response } = await unsplash.search.getPhotos(filters);

        const imagesResults = [];

        response.results.map((img) => {
            imagesResults.push({
                Url: img?.urls?.regular,
                Description: img.description ? img.description : "Sin descripcion"
            })
        })

        return res.status(200).send(imagesResults)

    } catch (error) {
        console.log(error)
        res.status(401).send("Hubo un error!")
    }

};

// Busca una imagen random
const getRandomImage = async (req, res) => {

    try {

        const { response } = await unsplash.photos.getRandom({
            count: 1,
        });

        return {
            imageUrl: response[0]?.urls?.regular,
            imageTitle: response[0].description ? response[0].description : "Sin descripcion"
        }

    } catch (error) {
        console.log(error)
        res.status(401).send("Hubo un error!")
    }

};

// Subir una imagen directamente desde la API externa a la bucket
const uploadToBucket = async (req, res) => {

    try {

        const { imageUrl, imageTitle } = await getRandomImage();

        const response = await got(imageUrl, {'responseType': 'buffer'});

        const uploadedImage = await s3.upload({
            Bucket: BUCKET_NAME,
            Key: `${imageTitle}.jpeg`,
            Body: response.body,
            ContentType: 'image/jpeg',
        }).promise()

        return res.send({
            Message: "Imagen Cargada con exito",
            Image: uploadedImage
        })

    } catch (error) {
        console.log(error)
        res.status(401).send("Hubo un error!")
    }
};


module.exports = { getImagesBy, uploadToBucket }