---
title: vscode中常用的光标和文本快捷键
date: 2020-03-25 20:12:34
urlname: cursor-and-text-shortcut-in-vscode
tags: [快捷键]
categories:
  - [vscode]
---

<style>
table tr td:first-child {
  width: 140px;
  white-space: nowrap;
}

table tr th {
  width: calc((100% - 140px) / 4);
}
</style>


在写代码的时候，常常需要对不同位置的代码同时处理，或则是需要选择一段代码进行复制或则移动。这时候通常就需要使用操作鼠标来移动光标或则选择文本，为了方便，文本编辑器一般都支持使用键盘快捷键来操作光标，但是每次想使用某个快捷键时就会忘记，需要去查阅，下次又会忘记，而且硬记实在记不住。

所以决定根据快捷键说明总结一下规律，也算在脑子认真过一遍。主要是 <kbd>up</kbd>、<kbd>down</kbd>、<kbd>left</kbd>、<kbd>right</kbd> 和 <kbd>cmd</kbd>、<kbd>shift</kbd>、<kbd>alt</kbd> 的一些组合。


|                  - | <kbd>up</kbd>                  | <kbd>down</kbd>                | <kbd>left</kbd>    | <kbd>right</kbd>   |
| -----------------: | ------------------------------ | ------------------------------ | ------------------ | ------------------ |
|   <kbd>cmd</kbd> + | 文本头                         | 文本尾                         | 光标所在行首       | 光标所在行尾       |
| <kbd>shift</kbd> + | 选择光标左边到上一行行尾的文本 | 选择光标右边到下一行行首的文本 | 光标左边的一个字符 | 光标右边的一个字符 |
|   <kbd>alt</kbd> + | 光标所在行向上移动一行         | 光标所在行向下移动一行         | 按单词向左移动光标 | 按单词向右移动光标 |

根据以上可以总结辅助键的功能为：

- <kbd>cmd</kbd>：移动光标
- <kbd>shift</kbd>：选择文本
- <kbd>alt</kbd>：移动文本、移动光标

它们组合的效果也有一些规律。

|                                   - |     <kbd>up</kbd>      |    <kbd>down</kbd>     |   <kbd>left</kbd>    |   <kbd>right</kbd>   |
| ----------------------------------: | -------------------- | -------------------- | ------------------ | ------------------ |
| <kbd>shift</kbd> + <kbd>cmd</kbd> + | 选择光标到文本头的文本 | 选择光标到文本尾的文本 | 光标左边到行首的文本 | 光标左边到行尾的文本 |
| <kbd>shift</kbd> + <kbd>alt</kbd> + |   向上复制光标所在行   |   向下复制光标所在行   |          -           |          -           |
|   <kbd>alt</kbd> + <kbd>cmd</kbd> + |    在上一行插入光标    |    在下一行插入光标    |     切换标签页      |     切换标签页      |


其他一些常用的快捷键：

- <kbd>shift</kbd> + <kbd>cmd</kbd> + <kbd>l</kbd>：<kbd>cmd</kbd> + <kbd>f</kbd> 打开文本搜索后可以快速在所有匹配项后插入光标，相当于使用 <kbd>alt</kbd> + <kbd>cmd</kbd> + <kbd>f</kbd> 文本替换

