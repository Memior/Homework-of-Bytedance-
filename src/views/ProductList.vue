<template>
  <div class="product-list-page">
    <!-- 头部导航 - 优化布局和间距 -->
    <header class="page-header">
      <div class="container">
        <div class="header-content">
          <h1 class="logo">
            <el-icon><Shop /></el-icon>
            <span>精品商城</span>
          </h1>
          
          <!-- 搜索框 - 增加间距 -->
          <div class="search-wrapper">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索商品名称或描述..."
              size="large"
              clearable
              @keyup.enter="handleSearch"
              class="search-input"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button 
              type="primary" 
              size="large"
              @click="handleSearch"
              :icon="Search"
              class="search-btn"
            >
              搜索
            </el-button>
          </div>
          
          <!-- 购物车 - 增加间距 -->
          <div class="cart-wrapper" @click="showCartDrawer = true">
            <el-badge :value="cartStore.itemCount" :hidden="cartStore.itemCount === 0" :max="99">
              <div class="cart-button">
                <el-icon :size="26"><ShoppingCart /></el-icon>
                <span class="cart-label">购物车</span>
              </div>
            </el-badge>
          </div>
        </div>
      </div>
    </header>

    <div class="container main-content">
      <el-row :gutter="24">
        <!-- 左侧筛选栏 -->
        <el-col :xs="24" :sm="24" :md="6" :lg="5">
          <el-affix :offset="80">
            <div class="filter-panel">
              <div class="filter-header">
                <h3>
                  <el-icon><Filter /></el-icon>
                  <span>筛选条件</span>
                </h3>
                <el-button 
                  link 
                  type="primary" 
                  @click="handleResetFilters"
                  :icon="RefreshRight"
                  class="reset-btn"
                >
                  重置
                </el-button>
              </div>

              <!-- 分类筛选 -->
              <div class="filter-section">
                <h4>
                  <el-icon><Grid /></el-icon>
                  <span>商品分类</span>
                </h4>
                <el-radio-group 
                  v-model="localFilters.category" 
                  @change="handleFilterChange"
                  class="category-radio-group"
                >
                  <el-radio label="" class="category-radio">
                    <span class="radio-content">
                      <el-icon><Star /></el-icon>
                      <span>全部分类</span>
                    </span>
                  </el-radio>
                  <el-radio 
                    v-for="cat in productStore.categories" 
                    :key="cat" 
                    :label="cat"
                    class="category-radio"
                  >
                    <span class="radio-content">
                      <el-icon><FolderOpened /></el-icon>
                      <span>{{ cat }}</span>
                    </span>
                  </el-radio>
                </el-radio-group>
              </div>

              <!-- 品牌筛选 -->
              <div class="filter-section">
                <h4>
                  <el-icon><Medal /></el-icon>
                  <span>品牌</span>
                </h4>
                <el-select
                  v-model="localFilters.brand"
                  placeholder="选择品牌"
                  clearable
                  @change="handleFilterChange"
                  style="width: 100%"
                  size="large"
                >
                  <el-option label="全部品牌" value="" />
                  <el-option
                    v-for="brand in productStore.brands"
                    :key="brand"
                    :label="brand"
                    :value="brand"
                  />
                </el-select>
              </div>

              <!-- 价格区间 - 修复功能 -->
              <div class="filter-section">
                <h4>
                  <el-icon><Coin /></el-icon>
                  <span>价格区间</span>
                </h4>
                <el-slider
                  v-model="priceRange"
                  range
                  :min="0"
                  :max="20000"
                  :step="100"
                  :format-tooltip="formatPrice"
                  @change="handlePriceChange"
                  class="price-slider"
                />
                <div class="price-range-display">
                  <el-tag type="success" size="large">¥{{ priceRange[0] }}</el-tag>
                  <span class="price-separator">至</span>
                  <el-tag type="danger" size="large">¥{{ priceRange[1] }}</el-tag>
                </div>
              </div>

              <!-- 当前筛选条件 -->
              <div class="active-filters" v-if="hasActiveFilters">
                <h4>
                  <el-icon><PriceTag /></el-icon>
                  <span>当前筛选</span>
                </h4>
                <div class="filter-tags">
                  <el-tag
                    v-if="localFilters.category"
                    closable
                    type="primary"
                    size="large"
                    @close="localFilters.category = ''; handleFilterChange()"
                  >
                    {{ localFilters.category }}
                  </el-tag>
                  <el-tag
                    v-if="localFilters.brand"
                    closable
                    type="success"
                    size="large"
                    @close="localFilters.brand = ''; handleFilterChange()"
                  >
                    {{ localFilters.brand }}
                  </el-tag>
                  <el-tag
                    v-if="isPriceFiltered"
                    closable
                    type="warning"
                    size="large"
                    @close="resetPriceFilter"
                  >
                    ¥{{ priceRange[0] }} - ¥{{ priceRange[1] }}
                  </el-tag>
                </div>
              </div>
            </div>
          </el-affix>
        </el-col>

        <!-- 右侧商品列表 -->
        <el-col :xs="24" :sm="24" :md="18" :lg="19">
          <!-- 工具栏 -->
          <div class="toolbar">
            <div class="result-info">
              <el-icon><Box /></el-icon>
              <span>找到</span>
              <strong>{{ productStore.sortedProducts.length }}</strong>
              <span>件商品</span>
            </div>
            
            <div class="sort-options">
              <span class="sort-label">
                <el-icon><Sort /></el-icon>
                <span>排序：</span>
              </span>
              <el-radio-group 
                v-model="productStore.sortBy" 
                @change="productStore.updateSortBy"
                size="default"
                class="sort-radio-group"
              >
                <el-radio-button label="default">综合</el-radio-button>
                <el-radio-button label="sales">销量</el-radio-button>
                <el-radio-button label="price-asc">
                  <span class="sort-btn-content">
                    <el-icon><SortUp /></el-icon>
                    <span>价格</span>
                  </span>
                </el-radio-button>
                <el-radio-button label="price-desc">
                  <span class="sort-btn-content">
                    <el-icon><SortDown /></el-icon>
                    <span>价格</span>
                  </span>
                </el-radio-button>
                <el-radio-button label="rating">评分</el-radio-button>
                <el-radio-button label="newest">最新</el-radio-button>
              </el-radio-group>
            </div>
          </div>

          <!-- 商品卡片列表 -->
          <el-skeleton :loading="productStore.loading" animated :count="6">
            <template #template>
              <div class="product-grid">
                <div class="product-card skeleton" v-for="n in 6" :key="n">
                  <el-skeleton-item variant="image" class="skeleton-image" />
                  <div class="skeleton-content">
                    <el-skeleton-item variant="h3" style="width: 80%" />
                    <el-skeleton-item variant="text" style="width: 60%" />
                    <el-skeleton-item variant="text" style="width: 40%" />
                  </div>
                </div>
              </div>
            </template>

            <template #default>
              <transition-group 
                name="product-list" 
                tag="div" 
                class="product-grid"
                v-if="productStore.paginatedProducts.length > 0"
              >
                <ProductCard
                  v-for="product in productStore.paginatedProducts"
                  :key="product.id"
                  :product="product"
                  @add-to-cart="handleAddToCart"
                />
              </transition-group>

              <!-- 空状态 -->
              <el-empty 
                v-else
                description="没有找到符合条件的商品"
                :image-size="200"
              >
                <el-button type="primary" size="large" @click="handleResetFilters">
                  清空筛选条件
                </el-button>
              </el-empty>
            </template>
          </el-skeleton>

          <!-- 分页 -->
          <div class="pagination-wrapper" v-if="productStore.sortedProducts.length > 0">
            <el-pagination
              v-model:current-page="productStore.pagination.currentPage"
              v-model:page-size="productStore.pagination.pageSize"
              :page-sizes="[12, 20, 40, 60]"
              :total="productStore.pagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              background
              @size-change="handleSizeChange"
              @current-change="handlePageChange"
            />
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 购物车抽屉 -->
    <CartDrawer v-model="showCartDrawer" />

    <!-- 回到顶部 -->
    <el-backtop :right="50" :bottom="50">
      <div class="backtop-content">
        <el-icon :size="24"><Top /></el-icon>
      </div>
    </el-backtop>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Search, Shop, ShoppingCart, RefreshRight, Filter, Grid, 
  Star, FolderOpened, Medal, Coin, PriceTag, Box, Sort,
  SortUp, SortDown, Top
} from '@element-plus/icons-vue'
import { useProductStore } from '@/stores/productStore'
import { useCartStore } from '@/stores/cartStore'
import ProductCard from '@/components/ProductCard.vue'
import CartDrawer from '@/components/CartDrawer.vue'

const router = useRouter()
const productStore = useProductStore()
const cartStore = useCartStore()

// 本地状态
const searchKeyword = ref('')
const showCartDrawer = ref(false)
const priceRange = ref([0, 20000]) // 独立的价格区间状态
const localFilters = reactive({
  category: '',
  priceRange: [],
  brand: '',
  keyword: ''
})

// 计算属性
const hasActiveFilters = computed(() => {
  return localFilters.category || 
         localFilters.brand || 
         isPriceFiltered.value ||
         localFilters.keyword
})

// 判断价格是否被筛选
const isPriceFiltered = computed(() => {
  return priceRange.value[0] > 0 || priceRange.value[1] < 20000
})

// 方法
const handleSearch = () => {
  localFilters.keyword = searchKeyword.value.trim()
  handleFilterChange()
}

const handlePriceChange = (value) => {
  // 价格变化时立即更新筛选
  localFilters.priceRange = [...value]
  handleFilterChange()
}

const resetPriceFilter = () => {
  priceRange.value = [0, 20000]
  localFilters.priceRange = []
  handleFilterChange()
}

const handleFilterChange = () => {
  // 防抖处理
  clearTimeout(window.filterTimeout)
  window.filterTimeout = setTimeout(() => {
    productStore.updateFilters(localFilters)
  }, 300)
}

const handleResetFilters = () => {
  localFilters.category = ''
  localFilters.brand = ''
  localFilters.priceRange = []
  localFilters.keyword = ''
  searchKeyword.value = ''
  priceRange.value = [0, 20000]
  productStore.resetFilters()
}

const formatPrice = (value) => {
  return `¥${value.toLocaleString()}`
}

const handlePageChange = (page) => {
  productStore.updatePagination(page)
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleSizeChange = (size) => {
  productStore.updatePagination(1, size)
}

const handleAddToCart = (product) => {
  cartStore.addToCart(product)
  ElMessage.success({
    message: `已将 ${product.name} 添加到购物车`,
    duration: 2000,
    showClose: true
  })
}

// 生命周期
onMounted(async () => {
  await productStore.fetchProducts()
})

// 监听筛选条件变化
watch(
  () => productStore.filters,
  () => {
    // 筛选条件变化时，重新计算总数
    productStore.pagination.total = productStore.sortedProducts.length
  },
  { deep: true }
)
</script>

<style lang="scss" scoped>
.product-list-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f5f7fa 0%, #f0f2f5 100%);
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
  position: sticky;
  top: 0;
  z-index: 100;
  
  .container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px;
  }
  
  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 40px;
    padding: 24px 0;
    min-height: 80px;
  }
  
  .logo {
    font-size: 28px;
    font-weight: bold;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 12px;
    white-space: nowrap;
    margin: 0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-2px);
      filter: brightness(1.1);
    }
    
    .el-icon {
      font-size: 32px;
    }
  }
  
  .search-wrapper {
    flex: 1;
    max-width: 700px;
    display: flex;
    gap: 16px;
    align-items: center;
    
    .search-input {
      flex: 1;
      
      :deep(.el-input__wrapper) {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border-radius: 24px;
        padding: 8px 20px;
        background: #fff;
        transition: all 0.3s;
        
        &:hover {
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
          transform: translateY(-1px);
        }
        
        &.is-focus {
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }
      }
      
      :deep(.el-input__inner) {
        font-size: 15px;
        color: #303133;
        
        &::placeholder {
          color: #909399;
        }
      }
    }
    
    .search-btn {
      border-radius: 24px;
      padding: 12px 32px;
      font-size: 16px;
      font-weight: 600;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      border: none;
      box-shadow: 0 4px 12px rgba(240, 147, 251, 0.4);
      transition: all 0.3s;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(240, 147, 251, 0.6);
      }
      
      &:active {
        transform: translateY(0);
      }
    }
  }
  
  .cart-wrapper {
    cursor: pointer;
    
    .cart-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 12px 20px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      transition: all 0.3s;
      color: #fff;
      
      &:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }
      
      &:active {
        transform: translateY(0);
      }
      
      .cart-label {
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 0.5px;
      }
    }
  }
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

.main-content {
  margin-top: 24px;
  padding-bottom: 60px;
}

.filter-panel {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  
  &:hover {
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
  }
  
  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 28px;
    padding-bottom: 20px;
    border-bottom: 2px solid #e4e7ed;
    
    h3 {
      margin: 0;
      font-size: 20px;
      color: #303133;
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 700;
      
      .el-icon {
        font-size: 22px;
        color: #667eea;
      }
    }
    
    .reset-btn {
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s;
      
      &:hover {
        transform: scale(1.05);
      }
    }
  }
  
  .filter-section {
    margin-bottom: 32px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    h4 {
      font-size: 16px;
      color: #606266;
      margin: 0 0 16px 0;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
      
      .el-icon {
        font-size: 18px;
        color: #409eff;
      }
    }
    
    .category-radio-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
      
      .category-radio {
        width: 100%;
        margin: 0;
        height: auto;
        
        :deep(.el-radio__input) {
          display: none;
        }
        
        :deep(.el-radio__label) {
          width: 100%;
          padding: 0;
        }
        
        .radio-content {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 14px 16px;
          border-radius: 12px;
          border: 2px solid #e4e7ed;
          transition: all 0.3s;
          cursor: pointer;
          font-size: 15px;
          font-weight: 500;
          color: #606266;
          
          .el-icon {
            font-size: 18px;
            color: #909399;
            transition: all 0.3s;
          }
          
          span {
            flex: 1;
          }
        }
        
        &:hover .radio-content {
          border-color: #409eff;
          background: #ecf5ff;
          transform: translateX(4px);
          
          .el-icon {
            color: #409eff;
          }
        }
        
        &.is-checked .radio-content {
          border-color: #409eff;
          background: linear-gradient(135deg, #ecf5ff 0%, #e1f0ff 100%);
          color: #409eff;
          box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
          
          .el-icon {
            color: #409eff;
          }
        }
      }
    }
    
    .price-slider {
      margin: 20px 0;
      
      :deep(.el-slider__runway) {
        height: 8px;
        border-radius: 4px;
      }
      
      :deep(.el-slider__bar) {
        background: linear-gradient(90deg, #67c23a 0%, #409eff 100%);
        height: 8px;
      }
      
      :deep(.el-slider__button) {
        width: 20px;
        height: 20px;
        border: 3px solid #409eff;
      }
    }
    
    .price-range-display {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16px;
      gap: 12px;
      
      .el-tag {
        font-size: 15px;
        font-weight: 600;
        padding: 8px 16px;
        border-radius: 8px;
      }
      
      .price-separator {
        color: #909399;
        font-size: 14px;
        font-weight: 500;
      }
    }
  }
  
  .active-filters {
    margin-top: 28px;
    padding-top: 24px;
    border-top: 2px solid #e4e7ed;
    
    h4 {
      font-size: 16px;
      color: #606266;
      margin: 0 0 16px 0;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
      
      .el-icon {
        font-size: 18px;
        color: #e6a23c;
      }
    }
    
    .filter-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      
      .el-tag {
        font-size: 14px;
        font-weight: 500;
        padding: 8px 14px;
        cursor: pointer;
        transition: all 0.3s;
        
        &:hover {
          transform: scale(1.05);
        }
      }
    }
  }
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 20px 28px;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
  flex-wrap: wrap;
  gap: 20px;
  
  .result-info {
    font-size: 16px;
    color: #606266;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
    
    .el-icon {
      font-size: 20px;
      color: #409eff;
    }
    
    strong {
      color: #409eff;
      font-size: 20px;
      margin: 0 4px;
      font-weight: 700;
    }
  }
  
  .sort-options {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .sort-label {
      font-size: 16px;
      color: #606266;
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      
      .el-icon {
        font-size: 18px;
        color: #409eff;
      }
    }
    
    .sort-radio-group {
      :deep(.el-radio-button__inner) {
        padding: 10px 20px;
        font-size: 15px;
        font-weight: 500;
        transition: all 0.3s;
        border-radius: 8px;
        
        &:hover {
          transform: translateY(-2px);
        }
      }
      
      :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-color: #667eea;
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
      }
      
      .sort-btn-content {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.skeleton {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  
  .skeleton-image {
    width: 100%;
    height: 280px;
  }
  
  .skeleton-content {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 48px;
  padding: 24px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
  
  :deep(.el-pagination) {
    .btn-prev,
    .btn-next,
    .el-pager li {
      font-weight: 600;
      border-radius: 8px;
      margin: 0 4px;
      transition: all 0.3s;
      
      &:hover {
        transform: translateY(-2px);
      }
    }
    
    .el-pager li.is-active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
    }
  }
}

.backtop-content {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  transition: all 0.3s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 24px rgba(102, 126, 234, 0.6);
  }
}

// 动画
.product-list-enter-active,
.product-list-leave-active {
  transition: all 0.5s ease;
}

.product-list-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

.product-list-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

// 响应式设计
@media (max-width: 992px) {
  .filter-panel {
    margin-bottom: 24px;
  }
}

@media (max-width: 768px) {
  .page-header {
    .header-content {
      flex-direction: column;
      gap: 16px;
      padding: 16px 0;
      min-height: auto;
      
      .logo {
        font-size: 24px;
        
        .el-icon {
          font-size: 28px;
        }
      }
      
      .search-wrapper {
        width: 100%;
        max-width: none;
        flex-direction: column;
        gap: 12px;
        
        .search-input {
          width: 100%;
        }
        
        .search-btn {
          width: 100%;
        }
      }
      
      .cart-wrapper {
        align-self: stretch;
        
        .cart-button {
          flex-direction: row;
          justify-content: center;
        }
      }
    }
  }
  
  .toolbar {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
    
    .sort-options {
      width: 100%;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      
      .sort-radio-group {
        width: 100%;
        
        :deep(.el-radio-button) {
          flex: 1;
        }
      }
    }
  }
  
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }
}
</style>
