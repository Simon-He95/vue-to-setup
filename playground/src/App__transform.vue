<script setup lang="ts">
defineOptions({
  name: 'App'
})
const props = defineProps<{items:number[];arr:[]}>()
const emit = defineEmits(["click"])
const bar = ref(0)
const fn = ()=>bar.value++
defineExpose({ bar })
emit("click");

},
mounted(){
this.fn()
console.log(this.bar) // 0
onMounted(()=>{
fn()
console.log(bar.value) // 0
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