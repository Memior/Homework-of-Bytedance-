import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getProductList } from '@/api/product'

export const useProductStore = defineStore('product', () => {
  // 状态
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  // 筛选条件
  const filters = ref({
    category: '',
    priceRange: [],
    brand: '',
    keyword: ''
  })
  
  // 排序方式
  const sortBy = ref('default')
  
  // 分页
  const pagination = ref({
    currentPage: 1,
    pageSize: 20,
    total: 0
  })
  
  // 缓存已加载的数据，提升性能
  const cachedData = ref(new Map())
  
  // 计算属性：过滤后的商品列表
  const filteredProducts = computed(() => {
    let result = [...products.value]
    
    // 分类筛选
    if (filters.value.category) {
      result = result.filter(p => p.category === filters.value.category)
    }
    
    // 品牌筛选
    if (filters.value.brand) {
      result = result.filter(p => p.brand === filters.value.brand)
    }
    
    // 价格区间筛选
    if (filters.value.priceRange.length === 2) {
      result = result.filter(p => 
        p.price >= filters.value.priceRange[0] && 
        p.price <= filters.value.priceRange[1]
      )
    }
    
    // 关键词搜索
    if (filters.value.keyword) {
      const keyword = filters.value.keyword.toLowerCase()
      result = result.filter(p => 
        p.name.toLowerCase().includes(keyword) || 
        p.description.toLowerCase().includes(keyword)
      )
    }
    
    return result
  })
  
  // 计算属性：排序后的商品列表
  const sortedProducts = computed(() => {
    const result = [...filteredProducts.value]
    
    switch (sortBy.value) {
      case 'price-asc':
        return result.sort((a, b) => a.price - b.price)
      case 'price-desc':
        return result.sort((a, b) => b.price - a.price)
      case 'sales':
        return result.sort((a, b) => b.sales - a.sales)
      case 'rating':
        return result.sort((a, b) => b.rating - a.rating)
      case 'newest':
        return result.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
      default:
        return result
    }
  })
  
  // 计算属性：分页后的商品列表
  const paginatedProducts = computed(() => {
    const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
    const end = start + pagination.value.pageSize
    return sortedProducts.value.slice(start, end)
  })
  
  // 计算属性：可用的分类列表
  const categories = computed(() => {
    const cats = new Set(products.value.map(p => p.category))
    return Array.from(cats)
  })
  
  // 计算属性：可用的品牌列表
  const brands = computed(() => {
    const brandSet = new Set(products.value.map(p => p.brand))
    return Array.from(brandSet)
  })
  
  // Actions
  
  // 获取商品列表
  const fetchProducts = async (force = false) => {
    const cacheKey = 'all-products'
    
    // 如果有缓存且不强制刷新，使用缓存
    if (!force && cachedData.value.has(cacheKey)) {
      products.value = cachedData.value.get(cacheKey)
      pagination.value.total = sortedProducts.value.length
      return
    }
    
    loading.value = true
    error.value = null
    
    try {
      const data = await getProductList()
      products.value = data
      cachedData.value.set(cacheKey, data)
      pagination.value.total = sortedProducts.value.length
    } catch (err) {
      error.value = err.message || '获取商品列表失败'
      console.error('获取商品列表失败:', err)
    } finally {
      loading.value = false
    }
  }
  
  // 更新筛选条件
  const updateFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
    pagination.value.currentPage = 1 // 重置到第一页
    pagination.value.total = sortedProducts.value.length
  }
  
  // 重置筛选条件
  const resetFilters = () => {
    filters.value = {
      category: '',
      priceRange: [],
      brand: '',
      keyword: ''
    }
    pagination.value.currentPage = 1
    pagination.value.total = sortedProducts.value.length
  }
  
  // 更新排序方式
  const updateSortBy = (sort) => {
    sortBy.value = sort
    pagination.value.currentPage = 1
  }
  
  // 更新分页
  const updatePagination = (page, pageSize) => {
    if (page) pagination.value.currentPage = page
    if (pageSize) pagination.value.pageSize = pageSize
  }
  
  // 清除缓存
  const clearCache = () => {
    cachedData.value.clear()
  }
  
  return {
    // 状态
    products,
    loading,
    error,
    filters,
    sortBy,
    pagination,
    
    // 计算属性
    filteredProducts,
    sortedProducts,
    paginatedProducts,
    categories,
    brands,
    
    // Actions
    fetchProducts,
    updateFilters,
    resetFilters,
    updateSortBy,
    updatePagination,
    clearCache
  }
})
