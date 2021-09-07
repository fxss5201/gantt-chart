# gantt-chart

甘特图，现支持单个任务的左右拖拽延长时间，或者是整体平移。

## 使用

```js
import { ganttChartTime } from 'gantt-chart-time'
Vue.use(ganttChartTime)
```

## props

|参数|说明|类型|可选值|默认值|
|---|---|---|---|---|
|ganttData|传入渲染甘特图的数据|Array|--|--|
|height|甘特图显示的高度，宽度默认为父元素的100%|String|--|500px|
|currentTime|当前位置，用于显示红线|String|--|--|
|allColumnParticleSize|横向一共多少个颗粒度|Number|--|90|
|startDate|横向开始日期，用于甘特图头部日期渲染|String|--|--|
|doneRenderMethods|当前任务完成程度的渲染方式，当前仅支持done|String|time：按照时间显示，done：按照完成程度展示（done / total）|done|
|isDraggable|是否启用拖拽排序、拖拽换行，暂时不支持|Boolean|--|false|
|slice|在甘特图里，一个颗粒度要划分乘多少片段，默认划分为24段，对应24小时|Number|--|24|
|stepSlice|在甘特图中，每次移动、拖动的时候占用多少片段|Number|--|24|
|isDebugger|是否开启数据打印，方便数据纠错|Boolean|--|false|

### ganttData 中的参数对应的含义

ganttData 实际上是一个二维数组，第一层是以行划分，行里面包括列

```js
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
    }
  ]
}
```

## Events

|事件名称|说明|回调参数|
|---|---|---|
|sizeChange|单个任务的左右拖拽延长时间，或者是整体平移均会触发 sizeChange 事件|回调参数具体如下|

### sizeChange 回调参数

```js
{
  "rowIndex": 0, // 第几行的某个元素变动
  "colIndex": 3,  // 第几行第几列的某个元素变动
  "rowId": "001",
  "colId": 14,
  "start": 53.5,
  "end": 53.5,
  "name": "fs11111：上蜡",
  "nameFormat": "{name} | {done}/{total}{unit}",
  "isShowDot": false,
  "dot": {
      "mainColor": "#f00",
      "secondaryColor": "#0f0"
  },
  "total": 600,
  "done": 300,
  "unit": "kg",
  "doStatus": 1,
  "style": {
      "borderColor": "#83b3f3",
      "backgroundColor": "#fff",
      "innerStyle": {
          "borderColor": "",
          "backgroundColor": ""
      }
  },
  "range": 1, //  颗粒度跨度，占多少颗粒度
  "isComputedRightBtnCanLeftSize": 1,  // 已完成的颗粒度
  "offset": 2.5,  // 左边空白占用的颗粒度跨度
  "currentBtn": "left",  //  当前触发事件的按钮
  "diffRange": 1  //  颗粒度更改的跨度，为正向右，为负向左
}
```

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

### Lints and fixes files

```
npm run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).
