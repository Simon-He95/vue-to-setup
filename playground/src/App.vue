<script lang="ts">
export default {
  props: {
    name:String
  },
  data(){
    return{
      name:'simon',
      count:14
    }
  },
  methods:{
    increment() {
      this.count++
    },
    decrement(){
      this.count--
    }
  },
  computed:{
    age(){
      return 'as'

    }
  },
  mounted(){
    console.log('hi') // 0
  }
}
</script>

<template>
  <div @click="increment">App {{count}}</div>
</template>

<style scoped lang="scss">
div{
  background-color: red;
}
</style>
