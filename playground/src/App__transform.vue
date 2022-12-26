<script setup lang="ts">
import { defineProps, ref, onMounted, computed } from 'vue'


const props = defineProps<{name:String}>()

const name = ref('simon')
const count = ref(14)

const age = computed(() => {
return 'as'
})

function increment() {
count.value++
}
function decrement(){
count.value--
}
onMounted(()=>{
console.log('hi') // 0
})
</script>

<template>
  <div @click="increment">App {{count}}</div>
</template>

<style scoped lang="scss">
div{
  background-color: red;
}
</style>