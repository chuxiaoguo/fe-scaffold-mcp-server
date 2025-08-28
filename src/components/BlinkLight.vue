<template>
  <div
    :class="lightClasses"
    :style="lightStyles"
    @click="handleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="light-inner" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AlertStatus } from '@/types'

interface Props {
  status: AlertStatus
  clickable?: boolean
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  animated?: boolean
}

interface Emits {
  (e: 'click'): void
}

const props = withDefaults(defineProps<Props>(), {
  clickable: false,
  size: 'medium',
  disabled: false,
  animated: true
})

const emit = defineEmits<Emits>()

const isHovered = ref(false)

// 计算样式类
const lightClasses = computed(() => {
  return [
    'blink-light',
    `blink-light--${props.status}`,
    `blink-light--${props.size}`,
    {
      'blink-light--clickable': props.clickable && !props.disabled,
      'blink-light--disabled': props.disabled,
      'blink-light--animated': props.animated,
      'blink-light--hovered': isHovered.value
    }
  ]
})

// 计算动态样式
const lightStyles = computed(() => {
  const styles: Record<string, string> = {}
  
  // 根据状态设置颜色和阴影
  switch (props.status) {
    case 'normal':
      styles['--light-color'] = 'var(--light-normal)'
      styles['--light-shadow'] = 'var(--light-shadow-normal)'
      break
    case 'warning':
      styles['--light-color'] = 'var(--light-warning)'
      styles['--light-shadow'] = 'var(--light-shadow-warning)'
      break
    default:
      styles['--light-color'] = 'var(--light-info)'
      styles['--light-shadow'] = 'var(--light-shadow-info)'
  }
  
  return styles
})

// 处理点击事件
const handleClick = () => {
  if (props.clickable && !props.disabled) {
    emit('click')
  }
}

// 处理鼠标悬停
const handleMouseEnter = () => {
  if (props.clickable && !props.disabled) {
    isHovered.value = true
  }
}

const handleMouseLeave = () => {
  isHovered.value = false
}
</script>

<style scoped lang="scss">
.blink-light {
  position: relative;
  display: inline-block;
  border-radius: 50%;
  background-color: var(--light-color);
  transition: all 0.3s ease;
  
  // 尺寸变体
  &--small {
    width: 12px;
    height: 12px;
  }
  
  &--medium {
    width: 16px;
    height: 16px;
  }
  
  &--large {
    width: 20px;
    height: 20px;
  }
  
  // 内部光点
  .light-inner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60%;
    height: 60%;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;
  }
  
  // 动画效果
  &--animated {
    animation: blink-pulse 2s infinite ease-in-out;
    
    &::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      border-radius: 50%;
      background: radial-gradient(circle, var(--light-shadow) 0%, transparent 70%);
      animation: blink-glow 2s infinite ease-in-out;
      z-index: -1;
    }
  }
  
  // 可点击状态
  &--clickable {
    cursor: pointer;
    
    &:hover {
      transform: scale(1.2);
      
      .light-inner {
        background-color: rgba(255, 255, 255, 0.5);
      }
      
      &.blink-light--animated {
        animation-duration: 1s;
      }
    }
    
    &:active {
      transform: scale(1.1);
    }
  }
  
  // 悬停状态
  &--hovered {
    box-shadow: 0 0 15px var(--light-shadow);
  }
  
  // 禁用状态
  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &.blink-light--animated {
      animation: none;
    }
    
    &::before {
      animation: none;
    }
  }
  
  // 状态特定样式
  &--normal {
    &.blink-light--animated {
      animation-timing-function: ease-in-out;
    }
  }
  
  &--warning {
    &.blink-light--animated {
      animation-timing-function: ease-in-out;
      animation-duration: 1.5s; // 警告状态闪烁更快
    }
  }
}

// 动画关键帧
@keyframes blink-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 5px var(--light-shadow);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
    box-shadow: 0 0 10px var(--light-shadow);
  }
}

@keyframes blink-glow {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

// 响应式调整
@media (max-width: 768px) {
  .blink-light {
    &--small {
      width: 10px;
      height: 10px;
    }
    
    &--medium {
      width: 14px;
      height: 14px;
    }
    
    &--large {
      width: 18px;
      height: 18px;
    }
  }
}
</style>