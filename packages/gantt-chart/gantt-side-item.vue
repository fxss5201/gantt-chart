<template>
  <qb-tooltip effect="light" :content="itemData.rowName" placement="top-start" :disabled="disabled">
    <div ref="ganttSideName" class="gantt-side-item">{{ itemData.rowName }}</div>
  </qb-tooltip>
</template>

<script>
export default {
  name: 'ganttSideItem',
  props: {
    itemData: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  data () {
    return {
      disabled: true
    }
  },
  mounted () {
    this.isHaveEllipsis(this.$refs.ganttSideName)
  },
  methods: {
    // 计算当前显示是否有省略号
    isHaveEllipsis (targetElement) {
      const range = document.createRange()
      range.setStart(targetElement, 0)
      range.setEnd(targetElement, targetElement.childNodes.length)
      const rangeWidth = range.getBoundingClientRect().width
      this.disabled = rangeWidth <= targetElement.clientWidth
    }
  }
}
</script>

<style lang="scss" scoped>
.gantt-side-item {
  width: 100%;
  height: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
