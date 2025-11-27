<template>
  <div class="product-detail-page">
    <div class="container">
      <el-button 
        class="back-btn" 
        :icon="ArrowLeft" 
        @click="router.back()"
      >
        返回列表
      </el-button>

      <el-skeleton :loading="loading" animated>
        <template #template>
          <div class="detail-skeleton">
            <el-skeleton-item variant="image" style="width: 500px; height: 500px;" />
            <div style="flex: 1; padding-left: 40px;">
              <el-skeleton-item variant="h1" style="width: 60%" />
              <el-skeleton-item variant="text" style="width: 80%; margin-top: 20px;" />
              <el-skeleton-item variant="text" style="width: 40%; margin-top: 20px;" />
            </div>
          </div>
        </template>

        <div class="product-detail" v-if="product">
          <!-- 商品图片 -->
          <div class="product-gallery">
            <el-image
              :src="product.image"
              :alt="product.name"
              fit="contain"
              :preview-src-list="[product.image]"
            />
          </div>

          <!-- 商品信息 -->
          <div class="product-main-info">
            <h1 class="product-title">{{ product.name }}</h1>
            
            <div class="product-tags" v-if="product.tags">
              <el-tag 
                v-for="tag in product.tags" 
                :key="tag"
                :type="getTagType(tag)"
              >
                {{ tag }}
              </el-tag>
            </div>

            <div class="product-rating">
              <el-rate
                v-model="product.rating"
                disabled
                show-score
                text-color="#ff9900"
              />
              <span class="sales">已售 {{ product.sales.toLocaleString() }} 件</span>
            </div>

            <div class="product-price-box">
              <div class="price-main">
                <span class="label">价格：</span>
                <span class="current">¥{{ product.price.toLocaleString() }}</span>
                <span 
                  class="original" 
                  v-if="product.originalPrice > product.price"
                >
                  ¥{{ product.originalPrice.toLocaleString() }}
                </span>
              </div>
            </div>

            <el-divider />

            <div class="product-specs">
              <div class="spec-item">
                <span class="spec-label">品牌：</span>
                <span class="spec-value">{{ product.brand }}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">分类：</span>
                <span class="spec-value">{{ product.category }}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">库存：</span>
                <span class="spec-value">{{ product.stock }} 件</span>
              </div>
            </div>

            <el-divider />

            <div class="product-description">
              <h3>商品描述</h3>
              <p>{{ product.description }}</p>
            </div>

            <div class="product-actions">
              <el-button 
                type="primary" 
                size="large"
                :icon="ShoppingCart"
                @click="handleAddToCart"
                :disabled="product.stock === 0"
              >
                加入购物车
              </el-button>
              <el-button 
                size="large"
                :icon="Star"
              >
                收藏
              </el-button>
            </div>
          </div>
        </div>
      </el-skeleton>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, ShoppingCart, Star } from '@element-plus/icons-vue'
import { getProductDetail } from '@/api/product'
import { useCartStore } from '@/stores/cartStore'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const product = ref(null)
const loading = ref(true)

const getTagType = (tag) => {
  const tagMap = {
    '热销': 'danger',
    '新品': 'success',
    '畅销': 'warning',
    '推荐': 'primary'
  }
  return tagMap[tag] || ''
}

const handleAddToCart = () => {
  cartStore.addToCart(product.value)
  ElMessage.success('已添加到购物车')
}

onMounted(async () => {
  try {
    const productId = route.params.id
    product.value = await getProductDetail(productId)
  } catch (error) {
    ElMessage.error('获取商品详情失败')
    console.error(error)
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
.product-detail-page {
  min-height: 100vh;
  padding: 30px 0;
  background: #f5f5f5;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.back-btn {
  margin-bottom: 20px;
}

.product-detail {
  display: flex;
  gap: 40px;
  background: #fff;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.product-gallery {
  width: 500px;
  flex-shrink: 0;
  
  .el-image {
    width: 100%;
    border-radius: 8px;
  }
}

.product-main-info {
  flex: 1;
  
  .product-title {
    font-size: 28px;
    color: #303133;
    margin: 0 0 20px 0;
    line-height: 1.4;
  }
  
  .product-tags {
    margin-bottom: 20px;
    
    .el-tag {
      margin-right: 8px;
    }
  }
  
  .product-rating {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 30px;
    
    .sales {
      color: #909399;
      font-size: 14px;
    }
  }
  
  .product-price-box {
    background: #fff7f0;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    
    .price-main {
      display: flex;
      align-items: baseline;
      gap: 12px;
      
      .label {
        font-size: 16px;
        color: #606266;
      }
      
      .current {
        font-size: 36px;
        font-weight: bold;
        color: #ff4d4f;
      }
      
      .original {
        font-size: 18px;
        color: #909399;
        text-decoration: line-through;
      }
    }
  }
  
  .product-specs {
    display: flex;
    flex-direction: column;
    gap: 15px;
    
    .spec-item {
      display: flex;
      font-size: 15px;
      
      .spec-label {
        color: #909399;
        width: 80px;
      }
      
      .spec-value {
        color: #303133;
        font-weight: 500;
      }
    }
  }
  
  .product-description {
    h3 {
      font-size: 18px;
      color: #303133;
      margin-bottom: 15px;
    }
    
    p {
      font-size: 15px;
      color: #606266;
      line-height: 1.8;
    }
  }
  
  .product-actions {
    display: flex;
    gap: 15px;
    margin-top: 40px;
  }
}

@media (max-width: 992px) {
  .product-detail {
    flex-direction: column;
    
    .product-gallery {
      width: 100%;
    }
  }
}
</style>
