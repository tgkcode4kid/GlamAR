const Cart = require("../models/Cart");
const jwt = require("jsonwebtoken");

exports.addToCart = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        code: "UNAUTHORIZED",
        message: "Authentication required",
      });
    }

    // Xác thực token
    const decoded = jwt.verify(token, "your_strong_jwt_secret_key_here");
    const userId = decoded.userId;

    // Lấy thông tin sản phẩm từ request body
    const { productId, name, price, quantity, image } = req.body;

    // Tìm giỏ hàng của user
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Kiểm tra sản phẩm đã có trong giỏ chưa
    const existingItem = cart.items.find(
      (item) => item.productId === productId
    );
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, name, price, quantity, image });
    }

    // Lưu giỏ hàng
    await cart.save();

    // Tính tổng số lượng sản phẩm
    const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    res.json({ success: true, cartCount });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getCartCount = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Tìm giỏ hàng theo userId (cả user và guest)
    const cart = await Cart.findOne({ userId });
    const count = cart
      ? cart.items.reduce((sum, item) => sum + item.quantity, 0)
      : 0;

    res.json({
      success: true,
      count: count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
