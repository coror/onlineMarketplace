require('dotenv').config()

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

class Stripe {
    static async processPayment(paymentData) {
        try {
            // Call the Stripe API methods to process the payment
            const charge = await stripe.charges.create(paymentData)

            console.log('Payment processed successfully: ', charge)
            return 'Payment processed successfully!'
        } catch (e) {
            console.log('Error processing payment: ', e)
            throw new Error('Error processing payment!')
        }
    }
}

module.exports = Stripe