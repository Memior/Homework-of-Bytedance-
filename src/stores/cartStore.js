import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  // 购物车商品列表
  const items = ref([])
  
  // 从 localStorage 加载购物车
  const loadCart = () => {
    try {
      const saved = localStorage.getItem('shopping-cart')
      if (saved) {
        items.value = JSON.parse(saved)
      }
    } catch (err) {
      console.error('加载购物车失败:', err)
    }
  }
  
  // 保存购物车到 localStorage
  const saveCart = () => {
    try {
      localStorage.setItem('shopping-cart', JSON.stringify(items.value))
    } catch (err) {
      console.error('保存购物车失败:', err)
    }
  }
  
  // 计算属性：购物车商品数量
  const itemCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })
  
  // 计算属性：购物车总价
  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  })
  
  // 添加商品到购物车
  const addToCart = (product, quantity = 1) => {
    const existingItem = items.value.find(item => item.id === product.id)
    
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      items.value.push({
        ...product,
        quantity
      })
    }
    
    saveCart()
  }
  
  // 从购物车移除商品
  const removeFromCart = (productId) => {
    const index = items.value.findIndex(item => item.id === productId)
    if (index > -1) {
      items.value.splice(index, 1)
      saveCart()
    }
  }
  
  // 更新商品数量
  const updateQuantity = (productId, quantity) => {
    const item = items.value.find(item => item.id === productId)
    if (item) {
      item.quantity = Math.max(1, quantity)
      saveCart()
    }
  }
  
  // 清空购物车
  const clearCart = () => {
    items.value = []
    saveCart()
  }
  
  // 初始化时加载购物车
  loadCart()
  
  return {
    items,
    itemCount,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  }
})
