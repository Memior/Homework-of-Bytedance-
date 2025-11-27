import axios from 'axios'
import { mockProducts } from './mockData'

// 创建 axios 实例
const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 可以在这里添加 token
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    return Promise.reject(error)
  }
)

// 是否使用 Mock 数据
const USE_MOCK = true

/**
 * 获取商品列表
 */
export const getProductList = async (params) => {
  if (USE_MOCK) {
    // 模拟网络延迟
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockProducts)
      }, 300)
    })
  }
  
  return request.get('/products', { params })
}

/**
 * 获取商品详情
 */
export const getProductDetail = async (id) => {
  if (USE_MOCK) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const product = mockProducts.find(p => p.id === parseInt(id))
        if (product) {
          resolve(product)
        } else {
          reject(new Error('商品不存在'))
        }
      }, 200)
    })
  }
  
  return request.get(`/products/${id}`)
}

/**
 * 搜索商品
 */
export const searchProducts = async (keyword) => {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = mockProducts.filter(p => 
          p.name.includes(keyword) || p.description.includes(keyword)
        )
        resolve(results)
      }, 300)
    })
  }
  
  return request.get('/products/search', { params: { keyword } })
}
