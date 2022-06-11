const jwt = require('jsonwebtoken');

const jwtGenerator = async (userId, name) => {

    const userData = { userId, name };

    try {

        const token = await jwt.sign(userData, process.env.SECRET_JWT, {
            expiresIn: '2h'
        });

        if (token) {
            return token;
        } else {
            return res.json({
                Error: "No se pudo generar el token correctamente"
            })
        }

    } catch (err) {
        console.log(err)
    }

}

module.exports = jwtGenerator;
