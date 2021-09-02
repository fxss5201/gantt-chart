<template>
  <div id="app">
    <timeView />
  </div>
</template>

<script>
import timeView from './components/time-view.vue'

export default {
  name: 'App',
  components: {
    timeView
  }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
