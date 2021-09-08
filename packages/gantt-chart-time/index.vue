<template>
  <div :style="{ height }" class="gantt-chart-box">
    <div class="gantt-header clearfix">
      <div class="gantt-side">
        <slot name="headerSelect"></slot>
      </div>
      <div class="header-content">
        <gantt-header
          :viewDateData="viewDateData"
          :currentTimeObj="currentTimeObj"
          :viewParticleSize="viewParticleSize"
          :allColumnWidth="allColumnWidth"
          :scrollInfo="scrollInfo"
          :scrollViewRange="scrollViewRange"
          @scrollCurrentInview="scrollCurrentInview"
          @scrollViewRangeChange="scrollViewRangeChange"
          @scrollView="scrollView"></gantt-header>
      </div>
    </div>
    <div class="gantt-body clearfix">
      <div class="gantt-side" ref="ganttSide">
        <div v-for="item in sideNameList" :key="item.rowId" class="gantt-side-name" :style="{ height: `${viewParticleSize.height}px`, lineHeight: `${viewParticleSize.height}px` }">
          <gantt-side-item :itemData="item"></gantt-side-item>
        </div>
      </div>
      <div class="body-content" ref="bodyContent" id="ganttViewBox">
        <gantt-view
          ref="ganttView"
          :isDraggable="isDraggable"
          :viewDateData="viewDateData"
          :currentTimeObj="currentTimeObj"
          :viewParticleSize="viewParticleSize"
          :allColumnWidth="allColumnWidth"
          :scrollInfo="scrollInfo"
          :viewData="viewData"
          :currentArea="currentArea"
          :doneRenderMethods="doneRenderMethods"
          :defaultColumnParticleSize="defaultColumnParticleSize"
          :slice="slice"
          :stepSlice="stepSlice"
          :isDebugger="isDebugger"
          @scroll="changeScrollInfo"
          @sizeChange="sizeChange"
          @progressClick="progressClick"
          @viewChange="viewChange"
          @dragChange="dragChange"></gantt-view>
      </div>
    </div>
    <div class="gantt-chart-control">
      <qb-button plain icon="qb-icon-plus" @click="viewScale('add')" class="control-btn"></qb-button>
      <qb-button plain icon="qb-icon-minus" @click="viewScale('reduce')" class="control-btn"></qb-button>
    </div>
  </div>
</template>

<script>
/**
 * 使用该组件注意事项：
 * progress 之间可以显示空白，但是暂时支持右侧拖拽，即无法修改开始的位置，只能修改结束的位置
 * 缩放功能，可通过缩放 viewParticleSize 颗粒度中的 width/height 实现，所有的布局均依赖于 viewParticleSize
 */
import cloneDeep from 'lodash.clonedeep'
import ganttHeader from './gantt-header.vue'
import ganttView from './gantt-view.vue'
import ganttSideItem from './gantt-side-item.vue'

export default {
  name: 'ganttChartTime',
  components: { ganttHeader, ganttView, ganttSideItem },
  props: {
    // 渲染页面所需要的数据
    ganttData: {
      required: true,
      type: Array,
      default () {
        return []
      }
    },
    height: {
      type: String,
      default: '500px'
    },
    // 当前位置，用于显示红线
    currentTime: {
      required: true,
      type: String,
      default: ''
    },
    // 横向一共多少个颗粒度
    allColumnParticleSize: {
      type: Number,
      default: 90
    },
    // 横向开始日期，用于甘特图头部日期渲染
    startDate: {
      required: true,
      type: String,
      default: ''
    },
    // 当前任务完成程度的渲染方式，time：按照时间显示，done：按照完成程度展示（done / total）
    doneRenderMethods: {
      type: String,
      default: 'done'
    },
    // 是否启用拖拽排序、拖拽换行
    isDraggable: {
      type: Boolean,
      default: false
    },
    // 在甘特图里，一个颗粒度要划分乘多少片段
    slice: {
      type: Number,
      default: 24
    },
    // 在甘特图中，每次移动、拖动的时候
    stepSlice: {
      type: Number,
      default: 24
    },
    // 是否开启数据打印，方便数据纠错
    isDebugger: {
      type: Boolean,
      default: false
    },
    // 初始化的时候计算颗粒度大小
    initComputed: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      defaultColumnParticleSize: 21,
      minColumnParticleSize: 7,
      maxColumnParticleSize: 0,
      viewData: [],
      // 显示大小颗粒度，内部包含宽高，后续整体缩放的时候直接改变传入的颗粒度就可以实现
      // 并且 width 也会作为平移的 step ，横向拖拽时最后一个颗粒度是否填满会四舍五入
      viewParticleSize: {
        width: 30,
        height: 32,
        minWidth: 20
      },
      scrollInfo: {
        scrollLeft: 0,
        scrollTop: 0
      },

      // 点击头部今天左右按钮一次滚动的距离
      scrollViewRange: 14,

      isFirefox: typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().indexOf('firefox') > -1,
      mousewheelFunction: null,
      ctrlScale: false
    }
  },
  computed: {
    allRowParticleSize () {
      return this.viewData.length
    },
    sideNameList () {
      return this.viewData.map((item) => {
        return {
          rowId: item.rowId,
          rowName: item.rowName
        }
      })
    },
    allColumnWidth () {
      return this.allColumnParticleSize * this.viewParticleSize.width
    },

    viewDateData () {
      return this.timeRanges(this.startDate, this.allColumnParticleSize)
    },
    currentTimeObj () {
      return this.timeStringToObject(this.currentTime)
    },
    currentArea () {
      return this.timeRangesDay(this.startDate, this.currentTime)
    }
  },
  watch: {
    ganttData: {
      handler (val) {
        this.isDebugger && console.log('index传入参数', JSON.parse(JSON.stringify(val)))
        if (!val.length) return false
        // 避免内部数据变更影响外部数据，所以深拷贝
        const data = cloneDeep(val)
        this.viewData = this.createViewData(data)
      },
      immediate: true,
      deep: true
    },
    viewData: {
      handler (val) {
        const data = cloneDeep(val)
        this.viewData = this.createViewData(data)
      },
      deep: true
    },
    scrollInfo: {
      handler (val) {
        this.$refs.ganttSide.scrollLeft = val.scrollLeft
        this.$refs.ganttSide.scrollTop = val.scrollTop
      },
      deep: true
    },
    viewParticleSize: {
      handler (val) {
        this.$set(this.viewParticleSize, 'sliceWidth', (val.width / this.slice).toFixed(2) * 1)
      },
      deep: true
    }
  },
  mounted () {
    if (this.initComputed) {
      this.computedViewParticleSize()
    }
    window.addEventListener('resize', this.computedViewParticleSize, false)
  },
  beforeDestroy () {
    this.ctrlScale && document.querySelector('#ganttViewBox').removeEventListener(this.isFirefox ? 'DOMMouseScroll' : 'mousewheel', this.mousewheelFunction, false)
    this.ctrlScale = false
    window.removeEventListener('resize', this.computedViewParticleSize, false)
  },
  methods: {
    // 计算视图颗粒度
    computedViewParticleSize () {
      if (this.$refs.bodyContent) {
        const ganttClientWidth = this.$refs.bodyContent.clientWidth
        const width = (ganttClientWidth / this.defaultColumnParticleSize).toFixed(2) * 1
        this.viewParticleSize.width = width > this.viewParticleSize.minWidth ? width : this.viewParticleSize.minWidth
        this.maxColumnParticleSize = (ganttClientWidth / this.viewParticleSize.minWidth).toFixed(2) * 1
      }
    },
    // 绑定 按住 ctrl 键鼠标滚轮缩放
    bindMousewheelScale () {
      this.ctrlScale = true
      if (!this.mousewheelFunction) {
        this.mousewheelFunction = (event) => {
          if (event.ctrlKey) {
            event.preventDefault()
            const delta = event.wheelDelta ? event.wheelDelta / 120 : -event.detail / 3
            if (delta > 0) {
              this.viewScale('add')
            } else {
              this.viewScale('reduce')
            }
          }
        }
        // 添加按住 ctrl 键缩放
        document.querySelector('#ganttViewBox').addEventListener(this.isFirefox ? 'DOMMouseScroll' : 'mousewheel', this.mousewheelFunction, false)
      }
    },
    // 界面缩放
    viewScale (val) {
      if (!this.maxColumnParticleSize) {
        this.computedViewParticleSize()
      }
      if (val === 'reduce') {
        this.defaultColumnParticleSize += 2
        if (this.defaultColumnParticleSize > this.maxColumnParticleSize) {
          this.defaultColumnParticleSize = this.maxColumnParticleSize
        }
      } else {
        this.defaultColumnParticleSize -= 2
        if (this.defaultColumnParticleSize < this.minColumnParticleSize) {
          this.defaultColumnParticleSize = this.minColumnParticleSize
        }
      }
      if (this.defaultColumnParticleSize < 10) {
        this.scrollViewRange = 7
      } else if (this.defaultColumnParticleSize < 22) {
        this.scrollViewRange = 14
      } else if (this.defaultColumnParticleSize < 60) {
        this.scrollViewRange = 30
      } else {
        this.scrollViewRange = 90
      }
      this.computedViewParticleSizeWidth()
    },
    // 计算颗粒度的宽度
    computedViewParticleSizeWidth () {
      const ganttClientWidth = this.$refs.bodyContent.clientWidth
      this.viewParticleSize.width = (ganttClientWidth / this.defaultColumnParticleSize).toFixed(2) * 1
    },

    viewChange (obj) {
      this.viewData = obj
    },

    // 周、两周、月、季度的切换
    scrollViewRangeChange (val) {
      this.scrollViewRange = val
      this.defaultColumnParticleSize = val
      if (this.defaultColumnParticleSize > this.maxColumnParticleSize) {
        this.defaultColumnParticleSize = this.maxColumnParticleSize
      }
      this.computedViewParticleSizeWidth()
      this.$nextTick(() => {
        this.scrollCurrentInview()
      })
    },

    // 视图左右移动
    scrollView (obj) {
      let length = obj.scrollViewRange * this.viewParticleSize.width
      if (obj.direction === 'left') length *= -1
      this.$refs.ganttView.scrollView(length)
    },

    // 头部点击今天的事件
    scrollCurrentInview () {
      this.$refs.ganttView.scrollCurrentInview()
    },

    // 甘特图修改之后，从内部往外触发的事件
    dragChange (obj) {
      this.isDebugger && console.log('dragChange', obj)
    },
    sizeChange (obj) {
      this.$emit('sizeChange', obj)
      this.isDebugger && console.log('sizeChange', obj)
      this.$set(this.viewData[obj.rowIndex].list, obj.colIndex, obj)
      // 右移非最后一个，需要将其之后的开始时间和结束时间后移
      if (['right', 'all'].includes(obj.currentBtn)) {
        if (obj.colIndex + 1 < this.viewData[obj.rowIndex].list.length) {
          for (let index = obj.colIndex + 1, len = this.viewData[obj.rowIndex].list.length; index < len; index++) {
            const element = this.viewData[obj.rowIndex].list[index]
            element.start += obj.diffRange
            element.end += obj.diffRange
          }
        }
      }
    },
    progressClick (obj) {
      this.$emit('progressClick', obj)
      this.isDebugger && console.log('progressClick', obj)
    },

    // 生成渲染图所需要的数据
    createViewData (val) {
      if (!val.length) return []
      val.forEach((item) => {
        if (item.list && item.list.length) {
          item.list.forEach((element, index, array) => {
            let { start } = element
            if (start < 0) start = 0
            element.range = start === 0 ? element.end - start : element.end - start + 1
            // 第一次计算的标识，之后不再进行百分比转换长度计算，主要是为了按照已完成进度显示的时候，当前进行中的拖拽右侧按钮时，向左最多可以拖拽的颗粒度
            if ([0, 1].includes(element.doStatus)) {
              if (this.doneRenderMethods === 'done') {
                if (!element.isComputedRightBtnCanLeftSize && element.isComputedRightBtnCanLeftSize !== 0) {
                  element.isComputedRightBtnCanLeftSize = ((element.done / element.total) * element.range).toFixed(2) * 1
                }
              }
            }
            if (index > 0 && element.start - array[index - 1].end > 1) {
              element.offset = element.start - array[index - 1].end - 1
            } else if (index === 0 && element.start > 0) {
              element.offset = element.start - 1
            }
          })
        }
      })
      this.isDebugger && console.log('index生成渲染图所需要的数据', JSON.parse(JSON.stringify(val)))
      return val
    },

    // 滚动事件
    changeScrollInfo (obj) {
      this.scrollInfo = obj
    },

    // 两个时间段内包含的天数， timeRangesDay("2021-06-25", "2021-06-28") = 3
    timeRangesDay (time1, time2) {
      if (!time1 || !time2) return 0
      const date1 = time1.replace(/-/g, '/').split(' ')[0]
      const date2 = time2.replace(/-/g, '/').split(' ')[0]
      const oneDay = 1000 * 60 * 60 * 24
      return ((new Date(date2).getTime() - new Date(date1).getTime()) / oneDay).toFixed(2) * 1
    },

    // 解析时间，返回时间对象
    timeStringToObject (time) {
      if (!time) return {}
      let date = time.replace(/-/g, '/')
      date = new Date(date)
      return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        hours: date.getHours(),
        minutes: date.getMinutes(),
        seconds: date.getSeconds()
      }
    },
    // 结合开始日期和持续天数，获取经历的月份，以及每月的天数信息
    timeRanges (startDate, dateRange) {
      const res = []
      const startDateObj = this.timeStringToObject(startDate)
      let { year, month } = startDateObj
      const currentMonthDays = this.getDaysInYearMonth(year, month - 1)
      let num = currentMonthDays - startDateObj.day + 1
      if (num >= dateRange) {
        num = dateRange
      }
      res.push({
        id: new Date(year, month - 1).getTime(),
        year,
        month,
        str: `${year}年${month}月`,
        range: num,
        start: startDateObj.day,
        end: num === dateRange ? startDateObj.day + num - 1 : currentMonthDays,
        width: `${num * this.viewParticleSize.width}px`,
        children: this.createMonths(year, month, num, startDateObj.day)
      })
      while (num < dateRange) {
        month += 1
        if (month > 12) {
          month = 1
          year += 1
        }
        const monthDays = this.getDaysInYearMonth(year, month - 1)
        num += monthDays
        let range = monthDays
        if (num > dateRange) {
          range -= num - dateRange
        }
        res.push({
          id: new Date(year, month).getTime(),
          year,
          month,
          str: `${year}年${month}月`,
          range,
          start: 1,
          end: range,
          width: `${range * this.viewParticleSize.width}px`,
          children: this.createMonths(year, month, range, 1)
        })
      }
      return res
    },
    // 获取某年某月有多少天
    getDaysInYearMonth (year, month) {
      const newMonth = parseInt(month, 10) + 1
      const date = new Date(year, newMonth, 0)
      return date.getDate()
    },
    // 获取年月日对应的星期
    getWeek (year, month, day) {
      const weeks = ['日', '一', '二', '三', '四', '五', '六']
      const week = new Date(year, month, day).getDay()
      return {
        weekName: weeks[week],
        week
      }
    },
    // 由年、月、天数、开始日期获取当月的天数和周几
    createMonths (year, month, rang, start) {
      return [...new Array(rang).keys()].map((item, index) => {
        const day = start + index
        return {
          day,
          ...this.getWeek(year, month - 1, day)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.gantt-chart-box {
  border: 1px solid #dcdfe6;
  border-top: 0;
  position: relative;
  .gantt-chart-control {
    position: absolute;
    right: 15px;
    bottom: 15px;
    z-index: 1000;
    width: 44px;
    .control-btn {
      min-width: 44px;
      border-radius: 5px;
    }
    .control-btn:nth-child(1) {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
    .control-btn + .control-btn {
      margin-left: 0;
      border-top: 0;
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }
  }
}
.gantt-header {
  height: 88px;
  .gantt-side {
    height: 88px;
    overflow: hidden;
  }
  .header-content {
    margin-left: 130px;
    height: 100%;
  }
}
.gantt-body {
  border-top: 1px solid #dcdfe6;
  height: calc(100% - 88px);
  position: relative;
  .gantt-side {
    height: 100%;
    overflow-y: hidden;
    padding-bottom: 17px;
  }
  .body-content {
    margin-left: 130px;
    height: 100%;
    overflow: hidden;
  }
}
.gantt-side {
  float: left;
  width: 130px;
  border-right: 1px solid #dcdfe6;
  .gantt-side-name {
    text-align: center;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}
</style>
