---
title: JavaScript 中 Date 的问题
date: 2020-05-02 15:30:42
urlname: problems-with-date-in-javascript
tags: [Date]
categories:
- js
---

上一篇文章提到我写日期组件的事，这篇文章就来总结下我使用原生 Date 来写日期组件遇到的问题。

## 我遇到的问题

### 一些容易造成歧义的点
月份从0开始，即 0\~11 表示 1\~12 月；构造函数只有一个参数时，表示用时间戳初始化，两个以上参数则为年月日时分秒毫秒的分解且为 local 时间。

### 不能方便的得到某月的天数
要得到某个月的日期展示数据，就需要知道这个月的天数，再根据要展示的行数来补充前一月和后一个月的日期。我使用的办法是，创建后一个月第一天的日期，再将天数设为`0`，因为Date可以自动纠正错误范围的日期，所以这个Date会重置为给定月的最后一天，即可得这个月的天数。
```js
function getDaysInMonth(year, month) {
  const date = new Date(year, month + 1);
  date.setDate(0);
  return date.getDate();
}
```

### 不能方便的对日期进行算数操作
日期选择器最常见的功能就时切换不同的月份、年份来选择对应的日期。比如，需要提供切换当前月前后两个月的按钮。当 `setMonth` 接收超过11的数字时，Date 会自动在年份中进一位，所以对于增加月份相对来说还比较方便；而当 `setMonth` 接收小于0的数时，行为会比较诡异，得到的结果是年份减一，月份为12 + num。举个例子：
```js
const date = new Date(2020, 0); // 2020-02-01

date.setMonth(-1); // 2019-12-01, year: 2020 - 1, month: 12 - 1 = 11(12月)
date.setMonth(-2)；// 2018-11-01, year: 2019 - 1, month: 12 - 2 = 10(11月)
```
所以处理月份的加减如下：
```js
function addMonth(date, num) {
  const newDate = new Date(date.getTime());
  newDate.setMonth(date.getMonth() + 1);
  return newDate;
}

function substractMonth(date, num) {
  const newDate = new Date(date.getTime());
  if (num < 0) num = 0;

  while(num--) {
    newDate.setDate(0); // 通过设置第 0 天让 Date 将月份自动矫正为上一个月
  }

  newDate.setDate(date.getDate());

  return newDate;
}
```
### 可变的
各种 set 操作的 api 都是直接改变原对象的值，所以每次需要通过计算得到另一个日期时都要新构建一个 Date 对象。

### 不能方便的比较不同精度的时间
常见的日期选择器通常可以提供接口设置一些禁选范围，这里就需要对时间进行比较。可以直接对Date对象使用比较操作符，比如 `<`、`>` 等，实际的比较的值就是`valueOf()` 方法返回的值，Date 原型重写了该方法，返回值与 `getTime()` 相同。
```js
const date = new Date();
date.getTime() === date.valueOf(); // true
```
这说明这种方式只能比较精确到毫秒的时间，但我们的需求可能还有只精确到日，精确到月，或则其他年月日自由组合的日期形式的比较。

### 没有单独的表示时间的对象
日期组件还配套着时间选择器，但是 js 中没有可以单独表示时间部分的对象。提供了可以以 Date 类型为初始化值，但是只取时间部分，确实很奇怪，所以表示时间大部分只能用字符串了。

## Date 的由来

设计时参考了 Java 1.0 中的 [java.util.Date 类](https://docs.oracle.com/javase/7/docs/api/java/util/Date.html)，但是这个类已经在 Java 1.1 版本中被废弃，而JavaScript中却一直使用至今。

## 归纳 Date 的问题

- 功能简陋
  1. 不支持日期的算数操作
  2. 不支持设置其他时区
- API 过时
  1. 跟不上 es6 的便捷语法，比如解构
- 类型不够丰富
  1. 历法不可扩展
  2. 缺失时间类型、时间间隔类型等
- 可变性

还有许多问题。

## 如何解决

### 使用库

- momentjs
- Luxon
- date-fns
- js-joda

### Temporal 提案
[proposal-temporal](https://github.com/tc39/proposal-temporal) 目前处于 stage-2 阶段，它的出现就是要解决现在Date中存在的问题。我会再写一篇文章来介绍这个新的对象~

## 参考
- [Time in JavaScript@贺师俊_FEDAY 2018](https://www.youtube.com/watch?v=1LoBfo5BD7M)
- [Fixing JavaScript Date – Getting Started](https://maggiepint.com/2017/04/09/fixing-javascript-date-getting-started/)