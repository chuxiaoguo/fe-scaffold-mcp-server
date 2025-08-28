<template>
  <div class="notification-center">
    <!-- 隐藏的音频元素 -->
    <audio ref="alertSound" preload="auto">
      <source src="/sounds/alert.mp3" type="audio/mpeg">
      <source src="/sounds/alert.wav" type="audio/wav">
    </audio>
    
    <audio ref="normalSound" preload="auto">
      <source src="/sounds/normal.mp3" type="audio/mpeg">
      <source src="/sounds/normal.wav" type="audio/wav">
    </audio>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useAlertStore } from '@/stores'
import type { AlertStatus } from '@/types'

interface Props {
  enabled?: boolean
  soundEnabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  enabled: true,
  soundEnabled: true
})

const alertStore = useAlertStore()
const alertSound = ref<HTMLAudioElement>()
const normalSound = ref<HTMLAudioElement>()
const notificationPermission = ref<NotificationPermission>('default')

// 请求通知权限
const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    try {
      const permission = await Notification.requestPermission()
      notificationPermission.value = permission
      return permission === 'granted'
    } catch (error) {
      console.error('Failed to request notification permission:', error)
      return false
    }
  }
  return false
}

// 显示桌面通知
const showDesktopNotification = (title: string, body: string, type: AlertStatus = 'warning') => {
  if (!props.enabled || notificationPermission.value !== 'granted') {
    return
  }
  
  const icon = type === 'warning' 
    ? '/icons/warning.png' 
    : '/icons/success.png'
  
  try {
    const notification = new Notification(title, {
      body,
      icon,
      badge: icon,
      tag: 'alert-notification',
      requireInteraction: type === 'warning',
      silent: !props.soundEnabled
    })
    
    // 点击通知时聚焦窗口
    notification.onclick = () => {
      window.focus()
      notification.close()
    }
    
    // 自动关闭通知
    setTimeout(() => {
      notification.close()
    }, type === 'warning' ? 10000 : 5000)
    
  } catch (error) {
    console.error('Failed to show notification:', error)
  }
}

// 播放声音
const playSound = (type: AlertStatus) => {
  if (!props.soundEnabled) return
  
  try {
    const audio = type === 'warning' ? alertSound.value : normalSound.value
    if (audio) {
      audio.currentTime = 0
      audio.play().catch(error => {
        console.error('Failed to play sound:', error)
      })
    }
  } catch (error) {
    console.error('Error playing sound:', error)
  }
}

// 处理告警状态变化
const handleAlertChange = (newAlerts: any[], oldAlerts: any[]) => {
  if (!oldAlerts.length) return // 初始加载时不触发通知
  
  // 检查新增的告警
  const newWarnings: string[] = []
  const resolvedWarnings: string[] = []
  
  newAlerts.forEach(newInstitution => {
    const oldInstitution = oldAlerts.find(old => old.institutionName === newInstitution.institutionName)
    
    if (oldInstitution) {
      Object.entries(newInstitution.alerts).forEach(([alertKey, newStatus]) => {
        const oldStatus = oldInstitution.alerts[alertKey]
        
        if (oldStatus !== newStatus) {
          if (newStatus === 'warning') {
            newWarnings.push(`${newInstitution.institutionName} - ${alertKey}`)
          } else if (oldStatus === 'warning' && newStatus === 'normal') {
            resolvedWarnings.push(`${newInstitution.institutionName} - ${alertKey}`)
          }
        }
      })
    }
  })
  
  // 发送通知
  if (newWarnings.length > 0) {
    playSound('warning')
    showDesktopNotification(
      '新增告警',
      `检测到 ${newWarnings.length} 个新告警：\n${newWarnings.slice(0, 3).join('\n')}${newWarnings.length > 3 ? '\n...' : ''}`,
      'warning'
    )
  }
  
  if (resolvedWarnings.length > 0) {
    playSound('normal')
    showDesktopNotification(
      '告警解除',
      `${resolvedWarnings.length} 个告警已解除：\n${resolvedWarnings.slice(0, 3).join('\n')}${resolvedWarnings.length > 3 ? '\n...' : ''}`,
      'normal'
    )
  }
}

// 监听告警数据变化
watch(
  () => alertStore.institutions,
  (newVal, oldVal) => {
    if (props.enabled && oldVal) {
      handleAlertChange(newVal, oldVal)
    }
  },
  { deep: true }
)

// 组件挂载时请求权限
onMounted(async () => {
  if (props.enabled) {
    await requestNotificationPermission()
  }
})

// 暴露方法供外部调用
defineExpose({
  showNotification: showDesktopNotification,
  playSound,
  requestPermission: requestNotificationPermission
})
</script>

<style scoped lang="scss">
.notification-center {
  display: none; // 隐藏组件，只提供功能
}
</style>