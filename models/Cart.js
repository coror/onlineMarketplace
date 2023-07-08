const AppUser = require('./AppUser')
const Product = require('./Product')
const Stripe = require('./Stripe')

class Cart extends Parse.Object {
    constructor() {
        super('Cart')
    }

    static async addToCart(req) {
        const { productId, userId, quantity } = req.params
        const cart = new Cart()

        const userQuery = new Parse.Query(AppUser)
        const user = await userQuery.get(userId, { useMasterKey: true })

        const productQuery = new Parse.Query(Product)
        const product = await productQuery.get(productId, { useMasterKey: true })
        const productQuantity = await product.get("quantity", { useMasterKey: true })

        if (quantity > productQuantity) {
            return 'Selected quantity is not in stock!'
        }

        cart.set('product', product)
        cart.set('user', user)
        cart.set('quantity', quantity)

        try {
            cart.save(null, { useMasterKey: true })
        } catch (e) {
            throw new Error(e)
        }
    }

    static async updateQuantityCart(req) {
        const { cartObjectId, quantity } = req.params

        const cartQuery = new Parse.Query(Cart)
        const cart = await cartQuery.get(cartObjectId, { useMasterKey: true })
        const cartProduct = cart.get("product", { useMasterKey: true })

        const productQuery = new Parse.Query(Product)
        const product = await productQuery.get(cartProduct.id, { useMasterKey: true })
        const productQuantity = product.get("quantity", { useMasterKey: true })

        if (quantity > productQuantity) {
            return 'Selected quantity is not in stock!'
        }

        cart.set('quantity', quantity)

        try {
            cart.save(null, { useMasterKey: true })
        } catch (e) {
            throw new Error(e)
        }
    }

    static async removeFromCart(req) {
        const { cartObjectId } = req.params

        const cartQuery = new Parse.Query(Cart)
        const cart = await cartQuery.get(cartObjectId, { useMasterKey: true })

        try {
            cart.destroy()
        } catch (e) {
            throw new Error(e)
        }
    }

    static async checkout(req) {
        const { user } = req.params

        const cartQuery = new Parse.Query(Cart)
        const userPointer = AppUser.createWithoutData(user) // because it is a pointer
        cartQuery.equalTo('user', userPointer)
        const carts = await cartQuery.find({ useMasterKey: true })

        // Retrieve the objectIds of the found carts
        const cartObjectIds = carts.map(cart => cart.id)

        let orderTotal = 0

        try {
            for (const cart of carts) {
                const quantity = cart.get('quantity')
                const product = cart.get('product')

                const productQuery = new Parse.Query(Product)
                const fetchedProduct = await productQuery.get(product.id)

                const price = fetchedProduct.get('price')

                orderTotal += price * quantity
            }

            const paymentData = {
                amount: parseInt(orderTotal),
                currency: req.params.currency,
                source: req.params.paymentToken
            }

            try {
                const result = await Stripe.processPayment(paymentData)

                return { result, cartObjectIds, orderTotal }
            } catch (stripeError) {
                console.log('Error processing payment with Stripe: ', stripeError);
                throw new Error('Error during checkout: Payment processing failed.');
            }


        } catch (e) {
            console.log('Error during checkout: ', e)
            throw new Error('Error during checkout: Failed to calculate order total.')
        }
    }

    static registerClass() {
        Parse.Object.registerSubclass('Cart', Cart)
    }
}

module.exports = Cart