const AppUser = require('./AppUser')

class Product extends Parse.Object {
    constructor() {
        super('Product')
    }

    static async createProduct(req) {
        Product.registerClass()

        const { title, description, price, quantity, category, userId } = req.params
        const product = new Product()

        product.set('title', title)
        product.set('description', description)
        product.set('price', price)
        product.set('quantity', quantity)
        product.set('category', category)

        const query = new Parse.Query(AppUser) // dont need to use 'User' as it is a default class
        const seller = await query.get(userId, { useMasterKey: true })

        const relation = product.relation('seller')
        relation.add(seller)
        // product.set('seller', seller.toPointer())

        try {
            product.set('seller', seller)
            await product.save(null, { useMasterKey: true })
        } catch (error) {
            throw new Error(error)
        }
    }

    static async deleteProduct(req) {
        Product.registerClass()
        const { productId } = req.params

        const query = new Parse.Query(Product)
        const product = await query.get(productId, { useMasterKey: true })

        if (product === undefined) {
            return 'Product was not found'
        }

        try {
            // Fetch associated images
            const relation = product.relation('images')
            const imageQuery = relation.query()
            const images = await imageQuery.find({ useMasterKey: true })

            // Delete associated images
            await Parse.Object.destroyAll(images, { useMasterKey: true })

            // Delete the product
            product.destroy()
        } catch (e) {
            throw new Error('Unable to delete product')
        }
    }

    static async updateProduct(req) {
        const { productId, title, description, price, quantity } = req.params

        const query = new Parse.Query(Product)
        const product = await query.get(productId, { useMasterKey: true })

        if (title) {
            product.set('title', title)
        }

        if (description) {
            product.set('description', description)
        }

        if (price) {
            product.set('price', price)
        }

        if (quantity) {
            product.set('quantity', quantity)
        }

        try {
            await product.save(null, { useMasterKey: true })
        } catch (e) {
            throw new Error(e)
        }
    }

    static async searchProducts(req) {
        const { title, minPrice, maxPrice, category } = req.params

        const query = new Parse.Query(Product)

        if (title) {
            query.equalTo('title', title)
        }

        if (category) {
            query.equalTo('category', category)
        }

        if (minPrice) {
            query.greaterThanOrEqualTo('price', Number(minPrice))
        }

        if (maxPrice) {
            query.lessThanOrEqualTo('price', Number(maxPrice))
        }

        try {
            const products = await query.find({ useMasterKey: true })
            return products
        } catch (error) {
            throw new Error('Error searching products: ' + error.message)
        }
    }

    static registerClass() {
        Parse.Object.registerSubclass('Product', Product)
    }
}

module.exports = Product