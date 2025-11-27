<template>
  <el-drawer
    v-model="visible"
    title="购物车"
    :size="drawerSize"
    direction="rtl"
  >
    <template #header>
      <div class="cart-header">
        <h3>购物车</h3>
        <el-badge :value="cartStore.itemCount" :hidden="cartStore.itemCount === 0" />
      </div>
    </template>

    <div class="cart-content">
      <!-- 购物车为空 -->
      <el-empty 
        v-if="cartStore.items.length === 0"
        description="购物车是空的"
        :image-size="150"
      >
        <el-button type="primary" @click="visible = false">
          去逛逛
        </el-button>
      </el-empty>

      <!-- 购物车商品列表 -->
      <div v-else class="cart-items">
        <transition-group name="cart-item">
          <div 
            v-for="item in cartStore.items" 
            :key="item.id"
            class="cart-item"
          >
            <div class="item-image">
              <el-image
                :src="item.image"
                :alt="item.name"
                fit="cover"
              />
            </div>
            
            <div class="item-info">
              <h4 class="item-name">{{ item.name }}</h4>
              <p class="item-price">¥{{ item.price.toLocaleString() }}</p>
              
              <div class="item-actions">
                <el-input-number
                  v-model="item.quantity"
                  :min="1"
                  :max="item.stock"
                  size="small"
                  @change="handleQuantityChange(item.id, item.quantity)"
                />
                
                <el-button
                  type="danger"
                  size="small"
                  :icon="Delete"
                  circle
                  @click="handleRemove(item.id)"
                />
              </div>
            </div>
          </div>
        </transition-group>
      </div>
    </div>

    <!-- 底部结算 -->
    <template #footer v-if="cartStore.items.length > 0">
      <div class="cart-footer">
        <div class="total-info">
          <div class="total-items">
            共 <strong>{{ cartStore.itemCount }}</strong> 件商品
          </div>
          <div class="total-price">
            <span class="label">总计：</span>
            <span class="price">¥{{ cartStore.totalPrice.toLocaleString() }}</span>
          </div>
        </div>
        
        <div class="footer-actions">
          <el-button @click="handleClearCart" :icon="Delete">
            清空购物车
          </el-button>
          <el-button type="primary" @click="handleCheckout" :icon="Check">
            去结算
          </el-button>
        </div>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Check } from '@element-plus/icons-vue'
import { useCartStore } from '@/stores/cartStore'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const cartStore = useCartStore()

// 控制抽屉显示
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 响应式抽屉尺寸
const drawerSize = computed(() => {
  return window.innerWidth < 768 ? '100%' : '450px'
})

// 更新商品数量
const handleQuantityChange = (productId, quantity) => {
  cartStore.updateQuantity(productId, quantity)
}

// 移除商品
const handleRemove = async (productId) => {
  try {
    await ElMessageBox.confirm(
      '确定要从购物车中移除该商品吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    cartStore.removeFromCart(productId)
    ElMessage.success('已从购物车移除')
  } catch {
    // 用户取消
  }
}

// 清空购物车
const handleClearCart = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空购物车吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    cartStore.clearCart()
    ElMessage.success('购物车已清空')
  } catch {
    // 用户取消
  }
}

// 去结算
const handleCheckout = () => {
  ElMessage.info('结算功能待开发')
  // 这里可以跳转到结算页面
  // router.push('/checkout')
}
</script>

<style lang="scss" scoped>
.cart-header {
  display: flex;
  align-items: center;
  gap: 12px;
  
  h3 {
    margin: 0;
    font-size: 18px;
    color: #303133;
  }
}

.cart-content {
  height: 100%;
  overflow-y: auto;
  
  .cart-items {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .cart-item {
    display: flex;
    gap: 12px;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 8px;
    transition: all 0.3s;
    
    &:hover {
      background: #ecf5ff;
    }
    
    .item-image {
      width: 80px;
      height: 80px;
      flex-shrink: 0;
      border-radius: 8px;
      overflow: hidden;
      
      .el-image {
        width: 100%;
        height: 100%;
      }
    }
    
    .item-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
      
      .item-name {
        margin: 0;
        font-size: 14px;
        color: #303133;
        line-height: 1.4;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
      
      .item-price {
        margin: 0;
        font-size: 16px;
        font-weight: bold;
        color: #ff4d4f;
      }
      
      .item-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: auto;
      }
    }
  }
}

.cart-footer {
  border-top: 1px solid #e4e7ed;
  padding-top: 20px;
  
  .total-info {
    margin-bottom: 20px;
    
    .total-items {
      font-size: 14px;
      color: #606266;
      margin-bottom: 8px;
      
      strong {
        color: #409eff;
      }
    }
    
    .total-price {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      
      .label {
        font-size: 14px;
        color: #606266;
      }
      
      .price {
        font-size: 24px;
        font-weight: bold;
        color: #ff4d4f;
      }
    }
  }
  
  .footer-actions {
    display: flex;
    gap: 12px;
    
    .el-button {
      flex: 1;
    }
  }
}

// 动画
.cart-item-enter-active,
.cart-item-leave-active {
  transition: all 0.3s ease;
}

.cart-item-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.cart-item-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
