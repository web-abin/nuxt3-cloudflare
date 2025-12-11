<template>
  <div class="min-h-screen">
    <!-- Navigation -->
    <Navigation />
    
    <!-- Hero Section with 3D Background -->
    <HeroSection />
    
    <!-- About Section -->
    <AboutSection />
    
    <!-- Skills Section -->
    <SkillsSection />
    
    <!-- Projects Section -->
    <ProjectsSection />
    
    <!-- Experience Section -->
    <ExperienceSection />
    
    <!-- Contact Section -->
    <ContactSection />
    
    <!-- 3D Background Canvas -->
    <div ref="canvasContainer" class="fixed inset-0 -z-10 opacity-30" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue'
import * as THREE from 'three'

// 初始化滚动动画
useScrollAnimation()

const canvasContainer = ref<HTMLElement>()

onMounted(() => {
  if (!canvasContainer.value) return

  // 创建 Three.js 场景
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  canvasContainer.value.appendChild(renderer.domElement)

  // 创建粒子系统
  const particlesGeometry = new THREE.BufferGeometry()
  const particlesCount = 1000
  const posArray = new Float32Array(particlesCount * 3)

  for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 20
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3))

  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.05,
    color: 0x8b5cf6,
    transparent: true,
    opacity: 0.6
  })

  const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial)
  scene.add(particlesMesh)

  camera.position.z = 5

  // 动画循环
  function animate() {
    requestAnimationFrame(animate)
    particlesMesh.rotation.x += 0.001
    particlesMesh.rotation.y += 0.002
    renderer.render(scene, camera)
  }

  animate()

  // 响应式处理
  const handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }

  window.addEventListener('resize', handleResize)

  // 清理函数
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    renderer.dispose()
    if (canvasContainer.value && renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement)
    }
  })
})
</script>
