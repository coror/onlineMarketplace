class AppUser extends Parse.User {
    constructor(attributes) {
        super(attributes)
    }

    static async signupUser(req) {
        AppUser.registerClass()

        const { name, surname, password, email, country } = req.params
        const user = new Parse.User()

        user.set('name', name)
        user.set('surname', surname)
        user.set('email', email)
        user.set('password', password)
        user.set('username', email)
        user.set('country', country)

        try {
            await user.signUp()
            return 'User was successfully created!'
        } catch (error) {
            throw new Error('Something went wrong')
        }
    }

    static registerClass() {
        Parse.Object.registerSubclass('_User', AppUser)
    }
}

module.exports = AppUser