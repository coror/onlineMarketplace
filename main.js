const AppUser = require('./models/AppUser')
const Product = require('./models/Product')
const Image = require('./models/Image')
const Cart = require('./models/Cart')

// USER
Parse.Cloud.define('signupUser', AppUser.signupUser)

// PRODUCT
Parse.Cloud.define('createProduct', Product.createProduct)

Parse.Cloud.define('deleteProduct', Product.deleteProduct)

Parse.Cloud.define('updateProduct', Product.updateProduct)

Parse.Cloud.define('searchProducts', Product.searchProducts)

// IMAGE
Parse.Cloud.define('uploadImage', Image.uploadImage)

Parse.Cloud.define('deleteImage', Image.deleteImage)

// CART
Parse.Cloud.define('addToCart', Cart.addToCart)

Parse.Cloud.define('updateQuantityCart', Cart.updateQuantityCart)

Parse.Cloud.define('removeFromCart', Cart.removeFromCart)

Parse.Cloud.define('checkout', Cart.checkout)