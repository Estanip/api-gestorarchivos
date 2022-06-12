const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: (email) => {
        const ck_email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        if (email.match(ck_email)) {
          return true
        } else {
          return false
        }
      },
      message: "Solo se permite direcciones de correos",
    },
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: (password) => {
        const ck_password = /^(?=.[0-9])[a-zA-Z0-9!@#$%^&]{6,30}$/
        if (password.match(ck_password)) {
          return true
        }
      },
      message: 'Solo se admite como minimo 6 y maximo 16 caracteres y un caracter especial'
    },
  }
});

module.exports = model("User", userSchema);
