<script lang="ts">
import { defineComponent, PropType, ref } from "vue"
import Header from "../components/Header.vue"
import Tab from "../components/Tab.vue"
import touchdir from "vtouchdir"
export default defineComponent({
  name: 'App',
  components: {
    Header,
    Tab,
  },
  directives: {
    force: {},
    touchdir,
  },
  props: {
    items: Array as PropType<number[]>,
    arr: []
  },
  emit: ["click"],
  setup(props, { emit, attrs, slots: mySlots, expose }) {
    const bar = ref(0)
    const fn = ()=>bar.value++
    expose({ bar })
    emit("click");
    return {
      bar,
      fn
    }
  },
  mounted(){
    this.fn()
    console.log(this.bar) // 0
  }
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
