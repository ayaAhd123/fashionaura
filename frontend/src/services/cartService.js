import API from '../api/axios';

export const cartService = {
  getCart: async () => {
    const response = await API.get('/cart');
    return response.data;
  },

  addToCart: async (productId, variantId = null, quantity = 1) => {
    const response = await API.post('/cart/add', {
      product_id: productId,
      product_variant_id: variantId,
      quantity,
    });
    return response.data;
  },

  updateCartItem: async (cartItemId, quantity) => {
    const response = await API.put(`/cart/update/${cartItemId}`, { quantity });
    return response.data;
  },

  removeFromCart: async (cartItemId) => {
    const response = await API.delete(`/cart/remove/${cartItemId}`);
    return response.data;
  },
};
