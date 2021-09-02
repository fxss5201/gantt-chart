// 导入组件，组件必须声明 name
import ganttChart from './index.vue'

// 为组件添加 install 方法，用于按需引入
ganttChart.install = function (Vue) {
  Vue.component(ganttChart.name, ganttChart)
}

export default ganttChart
