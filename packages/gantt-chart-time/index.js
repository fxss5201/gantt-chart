// 导入组件，组件必须声明 name
import ganttChartTime from './index.vue'

// 为组件添加 install 方法，用于按需引入
ganttChartTime.install = function (Vue) {
  Vue.component(ganttChartTime.name, ganttChartTime)
}

export default ganttChartTime
