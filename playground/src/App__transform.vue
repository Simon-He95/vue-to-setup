<script setup lang="ts">
defineOptions({
  name: 'App'
})
const props = defineProps<{items:number[];arr:[]}>()
const emit = defineEmits(["click"])
const bar = ref(0)
defineExpose({ bar })
emit("click");
</script>

<template>
  <div>App</div>
</template>

<style scoped lang="scss">
div{
  background-color: red;
}
</style>
