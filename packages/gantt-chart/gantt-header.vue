<template>
  <div class="gantt-header-box">
    <div ref="ganttHeader" class="gantt-header-wrap">
      <div class="gantt-header-content" :style="{ width: `${allColumnWidth}px` }">
        <div v-for="(item, index) in viewDateData" :key="item.id" class="header-item" :style="{ flexBasis: item.width }">
          <div class="header-item__title-wrap">
            <span class="header-item__title" :style="{ left: titleLeft[index] }">{{ item.str }}</span>
          </div>
          <div class="header-item__body">
            <div v-for="dayItem in item.children" :key="`${item.id}-${dayItem.day}`" class="header-item__body-item" :style="{ flexBasis: `${viewParticleSize.width}px` }">
              <span class="week">{{ dayItem.weekName }}</span>
              <div :class="{ cur: currentTimeObj.year === item.year && currentTimeObj.month === item.month && currentTimeObj.day === dayItem.day }" class="content">{{ dayItem.day }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="header-tools">
      <qb-select v-model="scrollRange" placeholder="请选择" class="tools-select">
        <qb-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></qb-option>
      </qb-select>
      <qb-button icon="qb-icon-arrow-left" type="text" class="arrow-btn" @click="scrollView('left')"></qb-button>
      <qb-button plain @click="scrollCurrentInview">今天</qb-button>
      <qb-button icon="qb-icon-arrow-right" type="text" class="arrow-btn" @click="scrollView('right')"></qb-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ganttHeader',
  props: {
    // 横向开始日期，用于甘特图头部日期渲染
    currentTimeObj: {
      type: Object,
      default () {
        return {}
      }
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
    scrollInfo: {
      type: Object,
      default () {
        return {}
      }
    },
    scrollViewRange: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      options: [
        {
          label: '周',
          value: 7
        },
        {
          label: '两周',
          value: 14
        },
        {
          label: '月',
          value: 30
        },
        {
          label: '季度',
          value: 90
        }
      ],
      titleLeft: []
    }
  },
  computed: {
    scrollRange: {
      get () {
        return this.scrollViewRange
      },
      set (val) {
        this.$emit('scrollViewRangeChange', val)
      }
    }
  },
  watch: {
    scrollInfo: {
      handler (val) {
        this.$refs.ganttHeader.scrollLeft = val.scrollLeft
        this.$refs.ganttHeader.scrollTop = val.scrollTop
        this.computedTitleLeft()
      },
      deep: true
    }
  },
  methods: {
    computedTitleLeft () {
      const result = []
      let allLeft = 0
      this.viewDateData.map((item, index, array) => {
        if (index === 0) {
          const left = allLeft + parseInt(item.width) * 1 - 86
          if (this.scrollInfo.scrollLeft >= 0 && this.scrollInfo.scrollLeft < left) {
            result.push(`${this.scrollInfo.scrollLeft}px`)
          } else {
            result.push(`${left}px`)
          }
          allLeft += parseInt(item.width) * 1
        } else {
          const left = allLeft + parseInt(item.width) * 1 - 86
          if (this.scrollInfo.scrollLeft >= allLeft && this.scrollInfo.scrollLeft < left) {
            result.push(`${this.scrollInfo.scrollLeft}px`)
          } else {
            result.push(`${allLeft}px`)
          }
          allLeft += parseInt(item.width) * 1
        }
      })
      this.titleLeft = result
    },
    scrollCurrentInview () {
      this.$emit('scrollCurrentInview')
    },
    // 视图左右移动
    scrollView (val) {
      this.$emit('scrollView', {
        direction: val,
        scrollViewRange: Math.floor(this.scrollViewRange / 2)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.gantt-header-box {
  position: relative;
  width: 100%;
  height: 88px;
  .gantt-header-wrap {
    height: 100%;
    overflow-x: hidden;
    .gantt-header-content {
      position: relative;
      height: 100%;
      display: flex;
      align-items: stretch;
    }
  }
  .header-item {
    flex-grow: 0;
    flex-shrink: 0;
  }
  .header-item + .header-item {
    border-left: 1px solid #dcdfe6;
  }
  .header-item__title-wrap {
    height: 50px;
    font-size: 14px;
    .header-item__title {
      position: absolute;
      top: 5px;
      z-index: 1;
      padding: 10px;
    }
  }
  .header-item__body {
    width: 100%;
    display: flex;
    align-items: center;
    height: 38px;
    .header-item__body-item {
      flex-grow: 0;
      flex-shrink: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
    }
    .header-item__body-item + .header-item__body-item {
      border-left: 1px solid #dcdfe6;
    }
    .week {
      font-size: 12px;
      color: #ddd;
      margin-right: 2px;
    }
    .content {
      width: 18px;
      height: 18px;
      text-align: center;
      line-height: 18px;
      border-radius: 50%;
      &.cur {
        color: #fff;
        background-color: #f00;
      }
    }
  }

  .header-tools {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 1;
    padding: 12px 12px 0 0;
    width: 205px;
    height: 44px;
    display: flex;
    align-items: center;
    background-color: #fff;
    .tools-select {
      width: 70px;
      /deep/ .qb-input {
        width: 70px;
      }
    }
    .arrow-btn {
      margin: 0 6px !important;
    }
    .qb-button + .qb-button {
      margin: 0;
    }
  }
}
</style>
