import Vue from 'vue'
import App from './App.vue'
import ganttChartTime from './../packages/gantt-chart/index.js'
import QBUI from 'qb-ui'
import 'qb-ui/lib/theme-chalk/index.css'

Vue.use(QBUI, {
  themeCache: true // 使用主题缓存，配合通知中心组件使用
})
Vue.use(ganttChartTime)

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
