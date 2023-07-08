const sharp = require('sharp')

class Image extends Parse.Object {
    constructor() {
        super('Image')
    }

    static async uploadImage(req) {
        Image.registerClass()

        const { data, productId } = req.params

        const query = new Parse.Query('Product');
        const product = await query.get(productId, { useMasterKey: true })

        if (!product) {
            throw new Error('Product was not found');
        }

        const resizedImage = await sharp(Buffer.from(data, 'base64')).resize(320, 420).toBuffer()
        // const resizedImage = await sharp(data).resize(320, 420).toBuffer() // if i put jpeg,jpg,etc
        const resizedFile = new Parse.File('resized-photo.jpg', { base64: resizedImage.toString('base64') })
        // resizedFile.save(null, { useMasterKey: true })

        const image = new Image()
        image.set('file', resizedFile)

        const relation = product.relation('images')
        const imagesCount = await relation.query().count({ useMasterKey: true })

        if (imagesCount >= 5) {
            throw new Error('Product already has the maximum number of images.')
        }

        await image.save(null, { useMasterKey: true })


        relation.add(image)
        // product.set('productImage', image.toPointer()) // pointer is one-to-one or one-to-many
        try {
            await product.save(null, { useMasterKey: true })
        } catch (error) {
            throw new Error(error)
        }
    }

    static async deleteImage(req) {
        const { imageId } = req.params

        const query = new Parse.Query(Image)
        const image = await query.get(imageId, { useMasterKey: true })

        if (image === undefined) {
            return 'Image was not found!'
        }

        try {
            image.destroy()
        } catch (e) {
            throw new Error(e)
        }
    }

    static registerClass() {
        Parse.Object.registerSubclass('Image', Image)
    }
}

module.exports = Image