const bcrypt = require('bcryptjs');

const User = require('../../models/User');

const jwtGenerator = require('../../helpers/jwt');
const sendEmail = require('../../helpers/nodemailer');

const register = async (req, res) => {

    const { email, password } = req.body;

    try {

        // chequeo si ya existe el usuario
        let user = await User.findOne({ email });

        if (user) {
            return res.status(401).json({
                success: false,
                message: 'Ya existe el usuario'
            });
        }

        // creo el nuevo usuario
        user = new User(req.body);

        //Encripto la password
        const salt = bcrypt.genSaltSync();
        user.password = bcrypt.hashSync(password, salt);

        // Guardo el nuevo usuario en la DB
        await user.save();

        // Genero el JWT
        const token = await jwtGenerator(user._id, user.usuario);

        return res.status(201).send({
            success: true,
            message: `Se ha creado el usuario ${user.email}`,
            userid: user._id,
            user: user.email,
            token: token
        })

    } catch (error) {
        console.log(error)
        res.status(400).send("Hubo un error!")
    }
};

const login = async (req, res) => {

    const { email, password } = req.body;

    try {

        // chequeo si ya existe el usuario
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({
                success: false,
                message: 'No existe el usuario'
            });
        };

        // chequeo la pass desencriptandola
        const validaPassword = bcrypt.compareSync(password, user.password);

        if (!validaPassword) {
            return res.status(401).send({
                Message: 'Password incorrecto'
            })
        }

        //Generar JWT
        const token = await jwtGenerator(user.id, user.name);

        return res.status(201).send({
            success: true,
            message: "Usuario logueado con exito",
            userId: user.id,
            user: user.email,
            token: token
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
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({
                success: false,
                message: 'No existe el usuario'
            });
        };

        // link para recupero de contraseña
        const link = `${process.env.API_URL}/passreset/${user.id}`;

        // envio el mail para el proceso de recupero de contraseña
        const response = await sendEmail(email, `Hola ${email} haga click en el siguiente enlace para recuperar su contraseña: ${link}`);

        if (response.accepted.length > 0) {
            return res.status(200).send({
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
            await User.findByIdAndUpdate(userId, {password: encrytedPass});

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
