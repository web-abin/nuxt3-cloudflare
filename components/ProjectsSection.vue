<template>
  <section 
    class="min-h-screen flex items-center justify-center py-20"
    id="projects"
    data-animate
  >
    <div class="container mx-auto px-4">
      <h2 class="text-5xl font-bold mb-16 text-gradient text-center">
        作品展示
      </h2>
      
      <div v-if="projects" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div 
          v-for="(project, index) in projects" 
          :key="project.id"
          class="glass rounded-2xl overflow-hidden group cursor-pointer transform transition-all duration-500 hover:scale-105 hover:glow"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="relative h-64 overflow-hidden">
            <img 
              :src="project.image" 
              :alt="project.title"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div 
              v-if="project.featured"
              class="absolute top-4 right-4 bg-purple-500 px-3 py-1 rounded-full text-sm font-semibold"
            >
              精选
            </div>
          </div>
          
          <div class="p-6">
            <h3 class="text-2xl font-bold mb-3 text-purple-300">
              {{ project.title }}
            </h3>
            
            <p class="text-gray-300 mb-4 line-clamp-3">
              {{ project.description }}
            </p>
            
            <div class="flex flex-wrap gap-2 mb-4">
              <span 
                v-for="tag in project.tags" 
                :key="tag"
                class="px-3 py-1 bg-purple-500/30 rounded-full text-sm"
              >
                {{ tag }}
              </span>
            </div>
            
            <a 
              :href="project.link"
              target="_blank"
              class="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
            >
              查看项目 →
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { data: projects } = await useFetch('/api/projects')
</script>
