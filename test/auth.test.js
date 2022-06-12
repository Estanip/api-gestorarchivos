// test/post.test.ts
const User = require('../src/models/User')
const db = require('./db')

beforeAll(async () => {
    await db.connect()
});

afterEach(async () => {
    await db.clearDatabase()
});

afterAll(async () => {
    await db.closeDatabase()
});

describe('auth test', () => {
    it('se crea el usuario correctamente', async () => {

        // cantidad de proposiciones
        expect.assertions(2)

        // creo una instancia del model 
        const user = new User()

        // seteo las propiedades del user
        user.email = 'test@test.com'
        user.password = 'Test'

        // intento guardar el user en la memoria de la DB
        await user.save()

        // Busco el objeto creado en la DB
        const userInDb = await User.findOne({ email: 'test@test.com' }).exec()
        console.log('Usuario creado en la memoria de la DB', userInDb)

        // Chequeo que el mail sea el esperado
        expect(userInDb.email).toEqual('test@test.com')

        // Chequeo que la contraseña sea la esperada
        expect(userInDb.password).toEqual('Test')
    });


    describe('se ingresa un formato invalido de email', () => {

        it('email sin formato correcto', async () => {


            // creo una instancia del model 
            const user = new User()

            // seteo las propiedades del user
            user.email = '23232asds'
            user.password = 'Test'

            // intento guardar el user en la memoria de la DB
            try {
                await user.save()
            } catch (err) {
                expect(err).toBeInstanceOf(Error);
            }
        });
    });

});
