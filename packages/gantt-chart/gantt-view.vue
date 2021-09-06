<template>
  <div ref="ganttView" class="gantt-view-box" @scroll="scrollEvent">
    <div class="gantt-view-wrap" :style="{ width: `${allColumnWidth}px`, height: `${viewParticleSize.height * allViewData.length}px` }">
      <!-- 用于渲染周末灰色 -->
      <div class="gantt-view-background">
        <div
          v-for="(item, index) in backgroundColumns"
          :key="`${item.day}-${item.week}-${index}`"
          class="background-column"
          :class="{ 'is-weekend': [0, 6].includes(item.week) }"
          :style="{ flexBasis: `${viewParticleSize.width}px` }"></div>
      </div>

      <div class="gantt-view-content">
        <div v-for="item in allViewData" :key="item.rowId" class="gantt-row" :style="{ height: `${viewParticleSize.height}px` }">
          <draggable
            v-if="isDraggable"
            :list="item.list"
            group="gantView"
            class="gantt-row-draggable"
            :move="draggableMove"
            @change="draggableChange">
            <gantt-progress
              v-for="progress in item.list"
              :key="progress.colId"
              :progressData="progress"
              :viewParticleSize="viewParticleSize"
              :currentArea="currentArea"
              :doneRenderMethods="doneRenderMethods"
              :slice="slice"
              :stepSlice="stepSlice"
              :isDebugger="isDebugger"
              @sizeChange="sizeChange"></gantt-progress>
          </draggable>
          <gantt-progress
            v-else
            v-for="progress in item.list"
            :key="progress.colId"
            :progressData="progress"
            :viewParticleSize="viewParticleSize"
            :currentArea="currentArea"
            :doneRenderMethods="doneRenderMethods"
            :slice="slice"
            :stepSlice="stepSlice"
            :isDebugger="isDebugger"
            @sizeChange="sizeChange"></gantt-progress>
        </div>
      </div>

      <div class="gantt-line-box" :style="{ left: currentLineLeft }"></div>
    </div>
  </div>
</template>

<script>
import cloneDeep from 'lodash.clonedeep'
import draggable from 'vuedraggable'
import ganttProgress from './gantt-progress.vue'

export default {
  name: 'ganttView',
  components: { draggable, ganttProgress },
  props: {
    // 横向开始日期，用于甘特图头部日期渲染
    currentTimeObj: {
      type: Object,
      default () {
        return {}
      }
    },
    currentArea: {
      type: Number,
      default: 0
    },
    doneRenderMethods: {
      type: String,
      default: ''
    },
    allColumnWidth: {
      type: Number,
      default: 0
    },
    viewParticleSize: {
      type: Object,
      default () {
        return {}
      }
    },
    viewDateData: {
      type: Array,
      default () {
        return []
      }
    },
    viewData: {
      type: Array,
      default () {
        return []
      }
    },
    scrollInfo: {
      type: Object,
      default () {
        return {}
      }
    },
    defaultColumnParticleSize: {
      type: Number,
      default: 0
    },
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
    }
  },
  data () {
    return {
      allViewData: [],
      hour: new Date().getHours(),
      fromRowId: null,
      toRowId: null
    }
  },
  computed: {
    // 渲染周末灰色背景
    backgroundColumns () {
      let res = []
      this.viewDateData.forEach((item) => {
        res = res.concat(item.children)
      })
      return res
    },

    // 当前时间红线的位置
    currentLineLeft () {
      return `${this.currentArea * this.viewParticleSize.width + parseInt((this.hour / 24) * this.viewParticleSize.width, 10)}px`
    }
  },
  watch: {
    viewData: {
      handler (val) {
        this.isDebugger && console.log('gantt-view传入参数', JSON.parse(JSON.stringify(val)))
        this.allViewData = cloneDeep(val)
      },
      deep: true,
      immediate: true
    },
    scrollInfo: {
      handler (val) {
        this.$refs.ganttView.scrollLeft = val.scrollLeft
        this.$refs.ganttView.scrollTop = val.scrollTop
      },
      deep: true
    }
  },
  mounted () {
    setTimeout(() => {
      this.scrollCurrentInview()
    }, 300)
  },
  methods: {
    // 将今天的滚动到可视区域
    scrollCurrentInview () {
      const left = (this.defaultColumnParticleSize / 3).toFixed(2) * 1
      const range = this.currentArea / this.defaultColumnParticleSize
      this.$refs.ganttView.scrollLeft = (((range > 0 ? range : 0) * this.defaultColumnParticleSize).toFixed(2) * 1 - left) * this.viewParticleSize.width
    },
    scrollView (val) {
      this.$refs.ganttView.scrollLeft = this.scrollInfo.scrollLeft + val
    },

    // scroll事件
    scrollEvent () {
      this.$emit('scroll', {
        scrollLeft: this.$refs.ganttView.scrollLeft,
        scrollTop: this.$refs.ganttView.scrollTop
      })
    },
    sizeChange (obj) {
      for (let i = 0, len = this.allViewData.length; i < len; i++) {
        const element = this.allViewData[i]
        if (element.rowId === obj.rowId) {
          for (let j = 0, innerLen = element.list.length; j < innerLen; j++) {
            const innerElement = element.list[j]
            if (innerElement.colId === obj.colId) {
              this.$emit('sizeChange', {
                outIndex: i,
                innerIndex: j,
                ...obj
              })
              break
            }
          }
          break
        }
      }
    },

    // 拖拽移动判断，已结束和当前进行中的不可拖拽交换顺序
    draggableMove (evt) {
      this.fromRowId = evt.draggedContext.element.rowId
      this.toRowId = evt.relatedContext.element.rowId
      const { draggedContext, relatedContext } = evt
      if (draggedContext.element.doStatus < 1 || relatedContext.element.doStatus < 1) {
        return false
      }
      return true
    },

    draggableChange (obj) {
      const { moved, added } = obj
      // 同一行内的吮吸移动
      if (moved) {
        console.log('moved', moved)
        let rowObj = {}
        for (let i = 0, len = this.allViewData.length; i < len; i++) {
          if (this.allViewData[i].rowId === this.toRowId) {
            rowObj = this.allViewData[i]
            break
          }
        }
        this.reCreateRowList(rowObj, this.toRowId)

        this.$emit('dragChange', rowObj.list[moved.newIndex])
      }
      // 不同行之前的移动
      if (added) {
        console.log('added', added)
        let fromRowObj = {}
        let toRowObj = {}
        for (let i = 0, len = this.allViewData.length; i < len; i++) {
          if (this.allViewData[i].rowId === this.fromRowId) {
            fromRowObj = this.allViewData[i]
          }
          if (this.allViewData[i].rowId === this.toRowId) {
            toRowObj = this.allViewData[i]
          }
        }

        this.reCreateRowList(fromRowObj, this.fromRowId)
        this.reCreateRowList(toRowObj, this.toRowId)
        this.$emit('dragChange', toRowObj.list[added.newIndex])
      }

      this.$emit('viewChange', this.allViewData)
    },

    reCreateRowList (row, rowId) {
      row.list.forEach((item, index, array) => {
        if (index === 0) {
          if (!item.offset && item.start > 0) {
            item.start = 0
          }
          const start = item.start === 0 ? item.start : item.start - 1
          item.end = start + item.range
        } else {
          item.start = array[index - 1].end + (item.offset ? item.offset : 0) + 1
          item.end = item.start + item.range - 1
        }
        if (item.rowId !== rowId) item.rowId = rowId
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.gantt-view-box {
  width: 100%;
  height: 100%;
  overflow: auto;
  .gantt-view-wrap {
    position: relative;
    left: 0;
    top: 0;
    min-height: 100%;
    .gantt-view-background {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      z-index: 1;
      display: flex;
      align-items: stretch;
      .background-column {
        &.is-weekend {
          background-color: #f5f5f5;
        }
      }
    }
    .gantt-view-content {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      z-index: 1;
      .gantt-row,
      .gantt-row-draggable {
        display: flex;
        align-items: center;
      }
      .gantt-row-draggable {
        flex: 1;
      }
    }
  }

  .gantt-line-box {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 100;
    width: 1px;
    background-color: #f00;
  }
}
</style>
