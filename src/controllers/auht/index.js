const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const jwtGenerator = require('../../helpers/jwt');
const { dynamoClient } = require('../../config/aws');
const sendEmail = require('../../helpers/nodemailer');

const register = async (req, res) => {

    const { email, password } = req.body;

    try {

        // chequeo si ya existe el usuario
        const params = {
            TableName: "users",
            FilterExpression: "contains(#email, :email)",
            ExpressionAttributeNames: {
                "#email": "email",
            },
            ExpressionAttributeValues: {
                ":email": email,
            }
        }

        const user = await dynamoClient.scan(params).promise()

        if (user.Count > 0) {
            return res.status(401).send({
                Message: `Ya existe un usuario con el email ${user.Items[0].email}`
            })
        } else {

            //Encriptar la password
            const salt = bcrypt.genSaltSync();
            let encrytedPass = bcrypt.hashSync(password, salt);

            const params = {
                TableName: "users",
                Key: {
                    id: uuidv4()
                },
                AttributeUpdates: {
                    email: { Action: "PUT", Value: email },
                    password: { Action: "PUT", Value: encrytedPass },
                },
                ReturnValues: "ALL_NEW"
            }

            // Intento crear el usuario
            const user = await dynamoClient.update(params).promise()

            if (user) {

                // Generar JWT
                const token = await jwtGenerator(user.Attributes?.id, user.Attributes?.email);

                return res.status(201).send({
                    Message: `Se ha creado el usuario ${user.Attributes?.email}`,
                    userid: user.Attributes?.id,
                    user: user.Attributes?.email,
                    Token: token
                })
            }

        }

    } catch (error) {
        console.log(error)
        res.status(400).send("Hubo un error!")
    }

};

const login = async (req, res) => {

    const { email, password } = req.body;

    try {

        // chequeo si ya existe el usuario
        const params = {
            TableName: "users",
            FilterExpression: "contains(#email, :email)",
            ExpressionAttributeNames: {
                "#email": "email",
            },
            ExpressionAttributeValues: {
                ":email": email,
            }
        }

        const user = await dynamoClient.scan(params).promise()

        if (user.Count === 0) {
            return res.status(401).send({
                Message: 'No existe el usuario'
            });
        }

        // chequeo la pass desencriptandola
        const validaPassword = bcrypt.compareSync(password, user.Items[0]?.password);

        if (!validaPassword) {
            return res.status(401).send({
                Message: 'Password incorrecto'
            })
        }

        //Generar JWT
        const token = await jwtGenerator(user.Items[0]?.id, user.Items[0]?.email);

        return res.status(201).send({
            Message: "Usuario logueado con exito",
            userId: user.Items[0]?.id,
            user: user.Items[0]?.email,
            token
        })

    } catch (error) {
        console.log(error)
        res.status(400).send("Hubo un error!")
    }

};

const passRecovery = async (req, res) => {

    const { email } = req.body;

    try {

        // chequeo si ya existe el usuario
        const params = {
            TableName: "users",
            FilterExpression: "contains(#email, :email)",
            ExpressionAttributeNames: {
                "#email": "email",
            },
            ExpressionAttributeValues: {
                ":email": email,
            }
        }

        const user = await dynamoClient.scan(params).promise()

        if (user.Count === 0) {
            return res.status(401).send({
                Message: 'No existe el usuario'
            });
        }

        // link para recupero de contraseña
        const link = `${process.env.API_URL}/passreset/${user.Items[0].id}`;

        // envio el mail para el proceso de recupero de contraseña
        const response = await sendEmail(email, `Hola ${email} haga click en el siguiente enlace para recuperar su contraseña: ${link}`);

        if (response.accepted.length > 0) {
            return res.satus(200).send({
                Message: "Email enviado con exito"
            })
        }

        return res.status(400).send({
            Message: "Error al enviar email"
        })

    } catch (error) {
        console.log(error)
        res.send("Hubo un error!")
    }

};

const passReset = async (req, res) => {

    const { userId } = req.params;
    const { password } = req.body;

    try {

        if (password) {

            //Encripto la password
            const salt = bcrypt.genSaltSync();
            const encrytedPass = bcrypt.hashSync(password, salt);

            // Busco el user por id para cambiar su pass
            const params = {
                TableName: "users",
                Key: {
                    id: userId
                },
                UpdateExpression: 'set password = :r',
                ExpressionAttributeValues: {
                    ':r': encrytedPass,
                }
            }

            // Actualizo el user con el nuevo pass
            const user = await dynamoClient.update(params).promise()

            return res.status(200).send({
                Message: "Contraseña actualizada con exito"
            });

        }
    } catch (error) {
        console.log(error)
        res.status(400).send("Hubo un error!")
    }

};

module.exports = {
    register,
    login,
    passRecovery,
    passReset
}
