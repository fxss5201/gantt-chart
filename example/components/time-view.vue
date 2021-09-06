<template>
  <div>
    <gantt-chart :ganttData="ganttData" :isDebugger="true" @sizeChange="sizeChange">
      <template v-slot:headerSelect>
        <div class="header-select">
          <div class="select-title">生产机台</div>
          <qb-select v-model="selectValue" placeholder="请选择" class="width-full">
            <qb-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"> </qb-option>
          </qb-select>
        </div>
      </template>
    </gantt-chart>
  </div>
</template>

<script>

export default {
  name: 'timeView',
  data () {
    return {
      options: [
        {
          value: '1',
          label: '黄金糕'
        },
        {
          value: '2',
          label: '双皮奶'
        }
      ],
      selectValue: '1',
      ganttData: [
        {
          // 横向也就是一个任务对应的多个排期
          rowId: '001',
          rowName: 'XS001XS001XS001XS001XS001XS001XS001XS001',
          // 横向任务中的排期
          list: [
            {
              rowId: '001', // 父级的 rowId
              colId: 11, // 当前 id
              start: 0, // 开始节点
              end: 20, // 结束节点
              name: 'fsafsdasfs：上蜡', // 名称字符串
              nameFormat: '{name} | {done}/{total}{unit}', // 名称 formatter，优先级高于 name
              isShowDot: false, // 是否显示圆点，即名称前的色圈
              dot: { // 色圈对应的颜色值
                mainColor: '#f00',
                secondaryColor: '#0f0'
              },
              total: 1000, // 总量
              done: 300, // 已完成
              unit: 'kg', // 单位
              doStatus: -1, // doStatus: 0 => 正在进行中，-1 => 已完成，1 => 未开始
              // 进度条样式   innerStyle 代表进度条内已完成的样式
              style: {
                borderColor: '#e2e2e2',
                backgroundColor: '#fff',
                innerStyle: {
                  borderColor: '',
                  backgroundColor: ''
                }
              }
            },
            {
              rowId: '001',
              colId: 12,
              start: 23,
              end: 30,
              name: 'fsafsdafsdfasfs：上蜡',
              nameFormat: '{name} | {done}/{total}{unit}',
              isShowDot: false,
              dot: {
                mainColor: '#f00',
                secondaryColor: '#0f0'
              },
              total: 1000,
              done: 300,
              unit: 'kg',
              doStatus: -1,
              style: {
                borderColor: '#e2e2e2',
                backgroundColor: '#fff',
                innerStyle: {
                  borderColor: '',
                  backgroundColor: ''
                }
              }
            },
            {
              rowId: '001',
              colId: 13,
              start: 31,
              end: 50,
              name: 'fsas：上蜡',
              nameFormat: '{name} | {done}/{total}{unit}',
              isShowDot: true,
              dot: {
                mainColor: '#f00',
                secondaryColor: '#0f0'
              },
              total: 500,
              done: 300,
              unit: 'kg',
              doStatus: 0,
              style: {
                borderColor: '#83b3f3',
                backgroundColor: '#c6e1ff',
                innerStyle: {
                  borderColor: '#4895ff',
                  backgroundColor: '#4895ff'
                }
              }
            },
            {
              rowId: '001',
              colId: 14,
              start: 52.5,
              end: 53.5,
              name: 'fs11111：上蜡',
              nameFormat: '{name} | {done}/{total}{unit}',
              isDoing: false,
              isShowDot: false,
              dot: {
                mainColor: '#f00',
                secondaryColor: '#0f0'
              },
              total: 600,
              done: 300,
              unit: 'kg',
              doStatus: 1,
              style: {
                borderColor: '#83b3f3',
                backgroundColor: '#fff',
                innerStyle: {
                  borderColor: '',
                  backgroundColor: ''
                }
              }
            },
            {
              rowId: '001',
              colId: 20,
              start: 56,
              end: 57,
              name: 'fs2222222：上蜡',
              nameFormat: '{name} | {done}/{total}{unit}',
              isDoing: false,
              isShowDot: false,
              dot: {
                mainColor: '#f00',
                secondaryColor: '#0f0'
              },
              total: 600,
              done: 300,
              unit: 'kg',
              doStatus: 1,
              style: {
                borderColor: '#83b3f3',
                backgroundColor: '#fff',
                innerStyle: {
                  borderColor: '#4895ff',
                  backgroundColor: ''
                }
              }
            }
          ]
        },
        {
          rowId: '002',
          rowName: 'XS002',
          list: [
            {
              rowId: '002',
              colId: 15,
              start: -3,
              end: 20,
              name: 'fsafsdasfs：上蜡',
              nameFormat: '{name} | {done}/{total}{unit}',
              isShowDot: false,
              dot: {
                mainColor: '#f00',
                secondaryColor: '#0f0'
              },
              total: 1000,
              done: 300,
              unit: 'kg',
              doStatus: -1,
              style: {
                borderColor: '#e2e2e2',
                backgroundColor: '#fff',
                innerStyle: {
                  borderColor: '#4895ff',
                  backgroundColor: ''
                }
              }
            },
            {
              rowId: '002',
              colId: 16,
              start: 21,
              end: 40,
              name: 'fsasfeeee：上蜡',
              nameFormat: '{name} | {done}/{total}{unit}',
              isShowDot: true,
              dot: {
                mainColor: '#f00',
                secondaryColor: '#0f0'
              },
              total: 900,
              done: 300,
              unit: 'kg',
              doStatus: 0,
              style: {
                borderColor: '#e8bb47',
                backgroundColor: '#fff2d0',
                innerStyle: {
                  borderColor: '#f7b800',
                  backgroundColor: '#f7b800'
                }
              }
            },
            {
              rowId: '002',
              colId: 17,
              start: 41,
              end: 50,
              name: 'fsa1234354s：上蜡',
              nameFormat: '{name} | {done}/{total}{unit}',
              isDoing: false,
              isShowDot: false,
              dot: {
                mainColor: '#f00',
                secondaryColor: '#0f0'
              },
              total: 600,
              done: 300,
              unit: 'kg',
              doStatus: 1,
              style: {
                borderColor: '#e8bb47',
                backgroundColor: '#fff',
                innerStyle: {
                  borderColor: '',
                  backgroundColor: ''
                }
              }
            },
            {
              rowId: '002',
              colId: 50,
              start: 51,
              end: 53,
              name: 'fs333333：上蜡',
              nameFormat: '{name} | {done}/{total}{unit}',
              isDoing: false,
              isShowDot: false,
              dot: {
                mainColor: '#f00',
                secondaryColor: '#0f0'
              },
              total: 600,
              done: 300,
              unit: 'kg',
              doStatus: 1,
              style: {
                borderColor: '#e8bb47',
                backgroundColor: '#fff',
                innerStyle: {
                  borderColor: '',
                  backgroundColor: ''
                }
              }
            }
          ]
        },
        {
          rowId: '003',
          rowName: 'XS003',
          list: [
            {
              rowId: '002',
              colId: 20,
              start: -3,
              end: 20,
              name: 'fsafsdasfs：上蜡',
              nameFormat: '{name} | {done}/{total}{unit}',
              isShowDot: false,
              dot: {
                mainColor: '#f00',
                secondaryColor: '#0f0'
              },
              total: 1000,
              done: 300,
              unit: 'kg',
              doStatus: -1,
              style: {
                borderColor: '#e2e2e2',
                backgroundColor: '#f1f1f1',
                innerStyle: {
                  borderColor: '#f1f1f1',
                  backgroundColor: '#f1f1f1'
                }
              }
            },
            {
              rowId: '002',
              colId: 21,
              start: 21,
              end: 40,
              name: 'fsasfeeee：上蜡',
              nameFormat: '{name} | {done}/{total}{unit}',
              isShowDot: true,
              dot: {
                mainColor: '#f00',
                secondaryColor: '#0f0'
              },
              total: 400,
              done: 300,
              unit: 'kg',
              doStatus: 0,
              style: {
                borderColor: '#e8bb47',
                backgroundColor: '#f1f1f1',
                innerStyle: {
                  borderColor: '#f7b800',
                  backgroundColor: '#f1f1f1'
                }
              }
            },
            {
              rowId: '002',
              colId: 22,
              start: 41,
              end: 50,
              name: 'fsa1234354s：上蜡',
              nameFormat: '{name} | {done}/{total}{unit}',
              isDoing: false,
              isShowDot: false,
              dot: {
                mainColor: '#f00',
                secondaryColor: '#0f0'
              },
              total: 600,
              done: 300,
              unit: 'kg',
              doStatus: 1,
              style: {
                borderColor: '#e8bb47',
                backgroundColor: '#f1f1f1',
                innerStyle: {
                  borderColor: '#f1f1f1',
                  backgroundColor: '#f1f1f1'
                }
              }
            },
            {
              rowId: '002',
              colId: 23,
              start: 51,
              end: 53,
              name: 'fs333333：上蜡',
              nameFormat: '{name} | {done}/{total}{unit}',
              isDoing: false,
              isShowDot: false,
              dot: {
                mainColor: '#f00',
                secondaryColor: '#0f0'
              },
              total: 600,
              done: 300,
              unit: 'kg',
              doStatus: 1,
              style: {
                borderColor: '#e8bb47',
                backgroundColor: '#f1f1f1',
                innerStyle: {
                  borderColor: '#f1f1f1',
                  backgroundColor: '#f1f1f1'
                }
              }
            }
          ]
        },
        {
          rowId: '004',
          rowName: 'XS004',
          list: [
            {
              rowId: '003',
              colId: 18,
              start: -3,
              end: 40,
              name: 'fsafsdasfs：上蜡',
              nameFormat: '{name} | {done}/{total}{unit}',
              isShowDot: true,
              dot: {
                mainColor: '#f00',
                secondaryColor: '#0f0'
              },
              total: 1000,
              done: 300,
              unit: 'kg',
              doStatus: 0,
              style: {
                borderColor: '#cfdff4',
                backgroundColor: '#eaf4ff',
                innerStyle: {
                  borderColor: '#4895ff',
                  backgroundColor: '#4895ff'
                }
              }
            }
          ]
        }
      ]
    }
  },
  created () {
    console.log(this.timeRangesDay('2021-06-25', '2021-06-28'))
  },
  methods: {
    sizeChange (obj) {
    },
    // 两个时间段内包含的天数， timeRangesDay("2021-06-25", "2021-06-28") = 3
    timeRangesDay (time1, time2) {
      if (!time1 || !time2) return 0
      const date1 = time1.replace(/-/g, '/').split(' ')[0]
      const date2 = time2.replace(/-/g, '/').split(' ')[0]
      const oneDay = 1000 * 60 * 60 * 24
      return Math.floor((new Date(date2).getTime() - new Date(date1).getTime()) / oneDay)
    },
    // 获取某年某月有多少天
    getDaysInYearMonth (year, month) {
      const newMonth = parseInt(month, 10) + 1
      const date = new Date(year, newMonth, 0)
      return date.getDate()
    }
  }
}
</script>

<style lang="scss" scoped>
.header-select {
  padding: 10px;
  text-align: center;
  width: 130px;
  .select-title {
    margin-top: 4px;
    margin-bottom: 12px;
  }
  .width-full {
    width: 100%;
    /deep/ .qb-input {
      width: 100%;
    }
  }
}
</style>
