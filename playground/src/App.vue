<script lang="ts">
export default {
  name: 'App',
  props: {
    name:String
  },
  data(){
    return{
      name:'simon',
      age:14
    }
  },
  methods:{
    increment() {
      this.age++
    },
    decrement(){
      this.age--
    }
  },
  computed:{
    name(){
      return 'as'
    },
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
  <div>App</div>
</template>

<style scoped lang="scss">
div{
  background-color: red;
}
</style>
