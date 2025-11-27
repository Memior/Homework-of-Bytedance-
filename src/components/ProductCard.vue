<template>
  <div 
    class="product-card"
    @click="goToDetail"
  >
    <!-- 商品图片 -->
    <div class="product-image">
      <img 
        :src="product.image" 
        :alt="product.name"
        @error="handleImageError"
        @load="imageLoading = false"
        v-show="!imageError && !imageLoading"
      />
      
      <!-- 加载中 -->
      <div v-if="imageLoading && !imageError" class="image-placeholder">
        <el-icon class="is-loading" :size="40"><Loading /></el-icon>
      </div>
      
      <!-- 加载失败显示默认图片 -->
      <div v-if="imageError" class="image-fallback">
        <el-icon :size="60"><Picture /></el-icon>
        <p>图片加载失败</p>
      </div>
      
      <!-- 标签 -->
      <div class="product-tags" v-if="product.tags && product.tags.length && !imageError">
        <el-tag 
          v-for="tag in product.tags.slice(0, 2)" 
          :key="tag"
          size="small"
          :type="getTagType(tag)"
          effect="dark"
        >
          {{ tag }}
        </el-tag>
      </div>
      
      <!-- 折扣标签 -->
      <div class="discount-badge" v-if="discountPercent > 0 && discountPercent < 10">
        <span class="discount-text">{{ discountPercent }}折</span>
      </div>
      
      <!-- 库存提示 -->
      <div class="stock-badge" v-if="product.stock < 50 && product.stock > 0">
        仅剩{{ product.stock }}件
      </div>
    </div>

    <!-- 商品信息 -->
    <div class="product-info">
      <!-- 商品名称 -->
      <h3 class="product-name" :title="product.name">
        {{ product.name }}
      </h3>
      
      <!-- 商品描述 -->
      <p class="product-desc">
        {{ product.description }}
      </p>
      
      <!-- 评分和销量 -->
      <div class="product-meta">
        <el-rate
          v-model="product.rating"
          disabled
          show-score
          text-color="#ff9900"
          score-template="{value}"
          :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
          size="small"
        />
        <span class="sales">
          <el-icon><TrendCharts /></el-icon>
          {{ formatSales(product.sales) }}
        </span>
      </div>
      
      <!-- 价格 -->
      <div class="product-price">
        <div class="price-row">
          <span class="current-price">¥{{ product.price.toLocaleString() }}</span>
          <span 
            class="original-price" 
            v-if="product.originalPrice && product.originalPrice > product.price"
          >
            ¥{{ product.originalPrice.toLocaleString() }}
          </span>
        </div>
      </div>
      
      <!-- 品牌 -->
      <div class="product-brand">
        <el-icon><Stamp /></el-icon>
        <span>{{ product.brand }}</span>
      </div>
      
      <!-- 操作按钮 -->
      <div class="product-actions" @click.stop>
        <el-button 
          type="primary" 
          size="default"
          :icon="ShoppingCart"
          @click="handleAddToCart"
          :disabled="product.stock === 0"
          class="add-cart-btn"
        >
          {{ product.stock === 0 ? '已售罄' : '加入购物车' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ShoppingCart, Loading, Picture, Stamp, TrendCharts
} from '@element-plus/icons-vue'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['add-to-cart'])

const router = useRouter()
const imageLoading = ref(true)
const imageError = ref(false)

// 计算折扣百分比
const discountPercent = computed(() => {
  if (props.product.originalPrice && props.product.originalPrice > props.product.price) {
    const discount = (props.product.price / props.product.originalPrice * 10).toFixed(1)
    return discount
  }
  return 0
})

// 格式化销量
const formatSales = (sales) => {
  if (sales >= 10000) {
    return `已售${(sales / 10000).toFixed(1)}万`
  }
  return `已售${sales}`
}

// 获取标签类型
const getTagType = (tag) => {
  const tagMap = {
    '热销': 'danger',
    '新品': 'success',
    '畅销': 'warning',
    '推荐': 'primary',
    '热门': 'danger',
    '5G': 'primary',
    '高端旗舰': 'danger',
    '轻薄本': 'success',
    '专业创作': 'primary',
    '降噪': 'success',
    '无线耳机': 'info',
    '影像旗舰': 'danger',
    '高性价比': 'success'
  }
  return tagMap[tag] || 'info'
}

// 处理图片加载错误
const handleImageError = (e) => {
  imageLoading.value = false
  imageError.value = true
  console.log('图片加载失败:', props.product.image)
}

// 跳转到详情页
const goToDetail = () => {
  router.push(`/product/${props.product.id}`)
}

// 添加到购物车
const handleAddToCart = () => {
  emit('add-to-cart', props.product)
}
</script>

<style lang="scss" scoped>
.product-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 2px solid transparent;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
    border-color: #409eff;
    
    .product-image {
      img {
        transform: scale(1.08);
      }
    }
    
    .add-cart-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
  }
  
  .product-image {
    position: relative;
    width: 100%;
    padding-top: 100%; // 1:1 比例
    overflow: hidden;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
    
    img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .image-placeholder {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #909399;
    }
    
    .image-fallback {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #c0c4cc;
      background: #f5f7fa;
      
      p {
        margin-top: 12px;
        font-size: 14px;
        color: #909399;
      }
    }
    
    .product-tags {
      position: absolute;
      top: 12px;
      left: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 2;
      
      .el-tag {
        backdrop-filter: blur(10px);
        font-weight: 500;
      }
    }
    
    .discount-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
      color: #fff;
      padding: 8px 16px;
      border-radius: 24px;
      font-size: 15px;
      font-weight: bold;
      box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .discount-text {
        letter-spacing: 1px;
      }
    }
    
    .stock-badge {
      position: absolute;
      bottom: 12px;
      right: 12px;
      background: rgba(255, 152, 0, 0.95);
      color: #fff;
      padding: 6px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
      z-index: 2;
      backdrop-filter: blur(10px);
    }
  }
  
  .product-info {
    padding: 18px;
    display: flex;
    flex-direction: column;
    flex: 1;
    
    .product-name {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 10px 0;
      line-height: 1.5;
      height: 3em;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    
    .product-desc {
      font-size: 13px;
      color: #909399;
      margin: 0 0 14px 0;
      line-height: 1.6;
      height: 3.2em;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    
    .product-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
      padding-bottom: 14px;
      border-bottom: 1px solid #e4e7ed;
      
      .sales {
        font-size: 13px;
        color: #909399;
        display: flex;
        align-items: center;
        gap: 4px;
        font-weight: 500;
      }
    }
    
    .product-price {
      margin-bottom: 12px;
      
      .price-row {
        display: flex;
        align-items: baseline;
        gap: 10px;
      }
      
      .current-price {
        font-size: 26px;
        font-weight: bold;
        color: #ff4d4f;
        font-family: 'Arial', sans-serif;
      }
      
      .original-price {
        font-size: 14px;
        color: #909399;
        text-decoration: line-through;
      }
    }
    
    .product-brand {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #606266;
      margin-bottom: 18px;
      padding: 8px 12px;
      background: #f5f7fa;
      border-radius: 8px;
      font-weight: 500;
      
      .el-icon {
        font-size: 16px;
        color: #409eff;
      }
    }
    
    .product-actions {
      margin-top: auto;
      
      .add-cart-btn {
        width: 100%;
        font-weight: 500;
        font-size: 15px;
        padding: 12px 0;
        border-radius: 10px;
        transition: all 0.3s;
        
        &:not(:disabled):hover {
          transform: translateY(-2px);
        }
      }
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .product-card {
    border-radius: 12px;
    
    .product-info {
      padding: 14px;
      
      .product-name {
        font-size: 14px;
      }
      
      .product-desc {
        font-size: 12px;
      }
      
      .product-price {
        .current-price {
          font-size: 22px;
        }
      }
    }
  }
}
</style>
