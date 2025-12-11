<template>
  <section 
    class="min-h-screen flex items-center justify-center py-20"
    id="experience"
    data-animate
  >
    <div class="container mx-auto px-4">
      <h2 class="text-5xl font-bold mb-16 text-gradient text-center">
        工作经历
      </h2>
      
      <div v-if="experiences" class="max-w-4xl mx-auto space-y-8">
        <div 
          v-for="(exp, index) in experiences" 
          :key="exp.id"
          class="glass rounded-2xl p-8 relative transform transition-all duration-500 hover:scale-105 hover:glow"
        >
          <div class="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
            <div>
              <h3 class="text-2xl font-bold text-purple-300 mb-2">
                {{ exp.position }}
              </h3>
              <p class="text-xl text-gray-300 mb-1">
                {{ exp.company }}
              </p>
            </div>
            <span class="text-purple-400 font-semibold mt-2 md:mt-0">
              {{ exp.period }}
            </span>
          </div>
          
          <p class="text-gray-300 mb-6">
            {{ exp.description }}
          </p>
          
          <div class="space-y-2">
            <h4 class="text-lg font-semibold text-purple-300 mb-3">主要成就：</h4>
            <ul class="space-y-2">
              <li 
                v-for="(achievement, aIndex) in exp.achievements" 
                :key="aIndex"
                class="flex items-start gap-2 text-gray-300"
              >
                <span class="text-purple-400 mt-1">✓</span>
                <span>{{ achievement }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { data: experiences } = await useFetch('/api/experience')
</script>
