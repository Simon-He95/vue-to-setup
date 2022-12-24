<script setup lang="ts">
defineOptions({
  name: 'App'
})
const props = defineProps<{name:String}>()

const name = ref('simon')
const age = ref(14)

function increment() {
age.value++
}
function decrement(){
age.value--
}
onMounted(()=>{
console.log('hi') // 0
})
</script>

<template>
  <div>App</div>
</template>

<style scoped lang="scss">
div{
  background-color: red;
}
</style>