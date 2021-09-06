<template>
  <div
    class="gantt-progress"
    :class="{
      'no-left-radius': progress.start < 0,
      'is-in-past': progress.doStatus === -1,
      'is-in-now': progress.doStatus === 0,
      'is-in-future': progress.doStatus === 1
    }"
    :style="{
      flexBasis: progressWidth,
      width: progressWidth,
      marginLeft: offsetWidth,
      borderColor: progress.style.borderColor,
      backgroundColor: progress.style.backgroundColor
    }"
    @mouseenter="progressMouseEnter"
    @mouseleave="progressMouseLeave">
    <template v-if="isNotNowDoing">
      <div v-if="progress.isShowDot && progress.dot" class="gantt-progress-dot" :style="{ borderColor: progress.dot.secondaryColor || progress.dot.mainColor, backgroundColor: progress.dot.mainColor }"></div>
      <qb-tooltip effect="light" :content="progressTitle" placement="top-start" :disabled="progressTitleDisabled">
        <div ref="progressTitle" class="gantt-progress-title">{{ progressTitle }}</div>
      </qb-tooltip>
    </template>
    <!-- 处于当前正处理的阶段 -->
    <div v-else class="gantt-progress-done" :style="{ width: doneWidth, borderColor: progress.style.innerStyle.borderColor, backgroundColor: progress.style.innerStyle.backgroundColor }">
      <div v-if="progress.isShowDot && progress.dot" class="gantt-progress-dot" :style="{ borderColor: progress.dot.secondaryColor || progress.dot.mainColor, backgroundColor: progress.dot.mainColor }"></div>
      <qb-tooltip effect="light" :content="progressTitle" placement="top-start" :disabled="progressTitleDisabled">
        <div ref="progressTitle" class="gantt-progress-title">{{ progressTitle }}</div>
      </qb-tooltip>
    </div>

    <!-- 左侧的拖拽图标 -->
    <div v-show="isShowLeftBtn && btnShow" @mouseenter="handleMouseEnter('left')" @mouseleave="handleMouseLeave('left')" @mousedown="onButtonDown" @touchstart="onButtonDown" :class="{ hover: hovering, dragging: dragging }" class="arrow-left-btn"></div>

    <!-- 右侧的拖拽图标，如果是已过去的则不显示 -->
    <div v-show="isShowRightBtn && btnShow" @mouseenter="handleMouseEnter('right')" @mouseleave="handleMouseLeave('right')" @mousedown="onButtonDown" @touchstart="onButtonDown" :class="{ hover: hovering, dragging: dragging }" class="arrow-right-btn"></div>
  </div>
</template>

<script>
import cloneDeep from 'lodash.clonedeep'

export default {
  name: 'ganttProgress',
  props: {
    // progress 对应的数据
    progressData: {
      type: Object,
      default () {
        return {}
      }
    },
    viewParticleSize: {
      type: Object,
      default () {
        return {}
      }
    },
    // 当前时间的位置
    currentArea: {
      type: Number,
      default: 0
    },
    doneRenderMethods: {
      type: String,
      default: ''
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
      progress: cloneDeep(this.progressData),
      hour: new Date().getHours(),
      progressTitleDisabled: false,
      btnShow: false,

      // 拖动的距离
      moveRightX: 0,
      moveleftX: 0,

      hovering: false,
      dragging: false,
      startX: 0,
      currentX: 0,
      currentBtn: 'right',

      timeout: null
    }
  },
  computed: {
    // 单个步骤的宽度
    stepSliceWidth () {
      return this.stepSlice === this.slice ? this.viewParticleSize.width : this.stepSlice * this.viewParticleSize.sliceWidth
    },
    // 标题title
    progressTitle () {
      if (this.progressData.nameFormat) {
        const nameList = this.progressData.nameFormat.match(/[a-zA-Z0-9]+/g)
        let nameStr = this.progressData.nameFormat
        nameList.forEach((item) => {
          nameStr = nameStr.replace(`{${item}}`, this.progressData[item])
        })
        return nameStr
      }
      return this.progressData.name
    },

    // 非当前进行中
    isNotNowDoing () {
      return [-1, 1].includes(this.progress.doStatus)
    },
    // 是否显示右侧拖拽图标
    isShowRightBtn () {
      return [0, 1].includes(this.progress.doStatus)
    },
    // 是否显示左侧拖拽图标
    isShowLeftBtn () {
      return [1].includes(this.progress.doStatus)
    },
    // 算出 progress 的初始长度
    oldProgressWidth () {
      return this.progress.range * this.viewParticleSize.width
    },
    /**
     * 右侧拖拽按钮可向左移动的最大距离，由于向左移动得到的距离是负的，所以可以认为是可移动的最小距离
     */
    rightBtnCanMoveXMin () {
      let res = 0
      if (this.isShowRightBtn) {
        // 必须剩余的时间跨度
        let range = 1
        if (this.progress.doStatus === 0) {
          // 当前任务完成程度的渲染方式，time按照最多可以挪到今天结束为止
          if (this.doneRenderMethods === 'time') {
            const diff = this.progress.start < 0 ? 1 : 2
            range = this.currentArea - (this.progress.start < 0 ? 0 : this.progress.start) + diff
          } else {
            const diff = 0
            range = (this.progress.start < 0 ? 0 : this.progress.start) + this.progress.isComputedRightBtnCanLeftSize - (this.progress.start < 0 ? 0 : this.progress.start) + diff
          }
        }
        const canMoveRange = this.progress.range - range
        const canMoveX = -1 * canMoveRange * this.viewParticleSize.width
        res = canMoveX
      }
      return res
    },
    // 包含移动距离的 progress 长度
    progressWidth () {
      return `${this.oldProgressWidth + this.moveRightX}px`
    },
    // progress 的左侧空白宽度
    offsetWidth () {
      return this.progress.offset ? `${this.progress.offset * this.viewParticleSize.width}px` : 0
    },
    // 已完成的宽度
    doneWidth () {
      let width = ''
      if (this.doneRenderMethods === 'time') {
        const start = this.progress.start < 0 ? 0 : this.progress.start
        let range = this.currentArea - start
        range = start === 0 ? range : range + 1
        width = `${range * this.viewParticleSize.width + parseInt((this.hour / 24) * this.viewParticleSize.width, 10)}px`
      } else {
        width = `${this.progress.isComputedRightBtnCanLeftSize * this.viewParticleSize.width}px`
      }
      return width
    }
  },
  watch: {
    progressData: {
      handler (val) {
        this.isDebugger && console.log('gantt-progress传入数据', JSON.parse(JSON.stringify(val)))
        this.progress = cloneDeep(val)
        setTimeout(() => {
          this.isHaveEllipsis(this.$refs.progressTitle)
        }, 100)
      },
      deep: true
    }
  },
  mounted () {
    setTimeout(() => {
      this.isHaveEllipsis(this.$refs.progressTitle)
    }, 100)
  },
  beforeDestroy () {
    if (this.timeout) clearTimeout(this.timeout)
  },
  methods: {
    progressMouseEnter () {
      this.btnShow = true
    },
    progressMouseLeave () {
      this.btnShow = false
    },
    // 计算当前显示是否有省略号
    isHaveEllipsis (targetElement) {
      const range = document.createRange()
      range.setStart(targetElement, 0)
      range.setEnd(targetElement, targetElement.childNodes.length)
      const rangeWidth = range.getBoundingClientRect().width
      this.progressTitleDisabled = rangeWidth <= targetElement.clientWidth
    },

    handleMouseEnter (val) {
      this.currentBtn = val
      this.hovering = true
    },
    handleMouseLeave (val) {
      this.currentBtn = val
      this.hovering = false
    },
    onButtonDown (event) {
      event.preventDefault()
      this.onDragStart(event)
      window.addEventListener('mousemove', this.onDragging)
      window.addEventListener('touchmove', this.onDragging)
      window.addEventListener('mouseup', this.onDragEnd)
      window.addEventListener('touchend', this.onDragEnd)
      window.addEventListener('contextmenu', this.onDragEnd)
    },
    onDragStart (event) {
      this.btnShow = true

      this.dragging = true
      if (event.type === 'touchstart') {
        event.clientX = event.touches[0].clientX
      }
      this.startX = event.clientX
    },
    onDragging (event) {
      this.btnShow = true

      if (this.dragging) {
        let diff = 0
        if (event.type === 'touchmove') {
          event.clientX = event.touches[0].clientX
        }
        this.currentX = event.clientX
        diff = this.currentX - this.startX
        if (this.currentBtn === 'right') {
          this.moveRightX = Math.max(this.rightBtnCanMoveXMin, diff)
        } else {
          this.moveLeftX = diff
        }
      }
    },
    onDragEnd () {
      if (this.dragging) {
        this.dragging = false
        let diffRange = 0
        // 右侧拖拽数据计算实现
        if (this.currentBtn === 'right') {
          const surplus = this.moveRightX % this.stepSliceWidth
          const half = this.stepSliceWidth / 2
          if (this.moveRightX > 0) {
            diffRange = Math.floor(this.moveRightX / this.stepSliceWidth)
            if (surplus > half) {
              diffRange += 1
              this.moveRightX = diffRange * this.stepSliceWidth
            } else {
              this.moveRightX = this.moveRightX - surplus
            }
          } else {
            diffRange = Math.ceil(this.moveRightX / this.stepSliceWidth)
            if (surplus * -1 > half) {
              diffRange -= 1
              this.moveRightX = diffRange * this.stepSliceWidth
            } else {
              this.moveRightX = this.moveRightX - surplus
            }
          }
          diffRange = diffRange * (this.stepSlice / this.slice)
          if (this.progress.doStatus === 0 && this.progress.end + diffRange < this.currentArea + 1) {
            this.progress.range = this.currentArea - this.progress.start + 2
            this.progress.end = this.currentArea + 2
          } else {
            this.progress.range += diffRange
            this.progress.end += diffRange
          }
        }
        this.$emit('sizeChange', {
          ...this.progress,
          currentBtn: this.currentBtn,
          colId: this.progress.colId,
          diffRange
        })
        this.moveRightX = 0
        this.moveLeftX = 0
        window.removeEventListener('mousemove', this.onDragging)
        window.removeEventListener('touchmove', this.onDragging)
        window.removeEventListener('mouseup', this.onDragEnd)
        window.removeEventListener('touchend', this.onDragEnd)
        window.removeEventListener('contextmenu', this.onDragEnd)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.gantt-progress {
  box-sizing: border-box;
  height: 22px;
  border: 1px solid #dcdfe6;
  border-radius: 100px;
  position: relative;
  display: flex;
  align-items: center;
  &.is-in-future {
    cursor: move;
    .gantt-progress-title {
      cursor: move;
    }
  }
  &.no-left-radius {
    border-left: 0;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    .gantt-progress-done {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
  }
  .gantt-progress-dot {
    margin-left: 3px;
    display: inline-block;
    vertical-align: middle;
    width: 10px;
    height: 10px;
    border: 3px solid transparent;
    border-radius: 50%;
    box-shadow: 0px 0px 3px #000;
  }
  .gantt-progress-title {
    box-sizing: border-box;
    display: inline-block;
    vertical-align: middle;
    height: 100%;
    max-width: 100%;
    padding: 0 5px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .gantt-progress-done {
    display: table-cell;
    vertical-align: middle;
    height: 90%;
    background-color: #358efe;
    border-radius: 100px;
    box-sizing: border-box;
    border: 1px solid #358efe;
    color: #fff;
    .gantt-progress-title {
      max-width: calc(100% - 15px);
    }
  }
  .arrow-left-btn,
  .arrow-right-btn {
    position: absolute;
    top: 0;
    bottom: 0;
    z-index: 10;
    margin: auto;
    width: 10px;
    height: 10px;
    background-color: #fff;
    border: 1px solid #8c8d90;
    border-radius: 50%;
    cursor: w-resize;
  }
  .arrow-left-btn {
    left: 0px;
  }
  .arrow-right-btn {
    right: 0px;
  }
}
</style>
