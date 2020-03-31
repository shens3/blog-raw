---
title: 学习URI
date: 2020-03-27 17:01:24
urlname: learn-URI
tags:
categories:
- web
---

## 什么是URI

URI的特征：
- 统一：有规定的语法
- 资源：互联网上的资源，比如文件、服务；现实生活中的资源，比如书
- 标识符：字符串包含了资源的信息，可以是名称可以是定位信息

以上的组合标识了一个资源。规范里强调，URI 的作用仅仅是资源的标识，并不代表资源可访问或则存在。

### URI 与 URL、URN的关系

{% asset_img no-shadow uri_type.png 300 'uri子类型' %}

- URI：统一资源标识符
- URL：统一资源定位符
- URN：统一资源名称

一个 URI 可以是 URL，也可以是 URN，也可以即是 URL 又是 URN。如果一个 URI 中的信息包含了指向资源的位置，比如网络中的服务器域名和路径，那么就可以认为这是一个 URL。如果一个 URI 中包含了该资源的全局唯一名称，那么可以认为这个是一个 URN。

## 语法
从左到右是一个权重递减的层次结构，每个部件的顺序不能颠倒。圆形框为分割符，方形框为部件，黄色内为可选，大括号内是该部分内部可能有的组成情况。

{% asset_img uri_syntax.png uri通用语法 %}

### scheme
大小写不敏感，字母开头，可由`数字`、`字母`、`-`、`+` 、`.`组成。不同的 scheme 定义为不同的 URI，每个 scheme 都有可以规定自己子部件的语法规范。

### path
可由`非保留字符`、`可选分割符`、`/`、`:`、`@`组成。`/`是作为层次结构的分割符。path 的语法以前面是否有 authority 大体分为两种情况：

1. 有 authority<span style="color: red;">（path-abempty）</span>
  1. 以 `/` 开头
  2. 为空
2. 无 authority
  1. 以 `/` 开头，但不能以 `//` 开头<span style="color: red;">（path-absolute）</span>
  2. 不能以 `/`、`:` 开头<span style="color: red;">（path-noscheme）</span>
  3. 合法字符<span style="color: red;">（path-rootless）</span>
  4. 为空<span style="color: red;">（path-empty）</span>

上述这些情况有对应的 URI 使用场景，详细在[用法](#%e7%94%a8%e6%b3%95)中介绍。

### query
从第一个 `?` 后的字符开始，到 `#` 字符或则 URI 尾部结束。可由`非保留字符`、`可选分割符`、`/`、`:`、`@`、`?`组成。这部件没有定义层次结构，常常用来列举需要传递的参数。每个 scheme 可根据自己的需要定义数据的分割符和数据的展现形式。

### fragment
从第一个 `#` 后的字符开始，到 URI 尾部结束。可由`非保留字符`、`可选分割符`、`/`、`:`、`@`、`?`组成。fragment 部分的含义与特定 scheme 无关，与这个URI 所标识的资源的 MIME 类型有关，因为相当于指向的是所标识资源中的某个部分。

### 浏览器相关API

#### Location

- href: URI
- origin: baseURI
- protocol: scheme + ':'
- host: host
- port: port
- pathname: path
- search: query 
- hash: fragment

## 编码
URI 由一组有限字符集组成，即 ASCII 字符集。规范中提供了一种编码方式，为了展示字符集中无符号表示的字符，如控制字符；为了区分 URI 中存在与保留字符相同的普通字符；为了展示 ASCII 范围以外属于其他字符编码的字符。这种方式为**百分号编码**，以一个字节为单位。

> % HEX HEX

字符的分类：
- 保留字符：
  - 通用分割符：`:`、`@`、`/`、`:`、`?`、`#`、`[`、`]`
  - 可选分割符：`;`、`&`、`=`、`*`、`$`、`,`、`(`、`)`、`+`、`!`、`'`
- 非保留字符：`数字`、`字母`、`-`、`_`、`.`、`~`

一般来说在用字符组装一个 URI 时才需要考虑编码问题，需要编码的情况有：
1. 控制字符，`0x00` 到 `0x20`，`0x7F`
2. 不安全字符， `{`、`}`、`<`、`>`、`"`、`|`、`\`、`^`、`%`、<code>`</code>
3. 非保留目的保留字符

### 浏览器对 URL 的编码行为
URI 规定超出 ASCII 编码的字符需要使用百分号编码，但是没有规定这些字符使用的字符编码，这很大程度上取决于浏览器的行为。我在 chrome 上进行了实验，分别在地址栏、提交表单、发送 ajax 请求这三种方式输入包含中文的 URI，结果是在地址栏被百分号编码的字节是 UTF-8，而在 form 和 ajax 中与文档的编码有关。

{% asset_img uri_encode_location.png uri浏览器地址栏编码 %}

{% asset_img uri_encode_http.png uri浏览器表单编码 %}

| 不同方式 | 编码       |
| :--------: | :----------: |
| 地址栏   | UTF-8      |
| form     | 文档的编码 |
| ajax     | 文档的编码 |

`深`的GBK编码的字节为 `0xC9EE`，UTF-8 为 `0xE6B7B1`。

> chrome 55版本后不支持自定义页面编码，需要自己安装插件 Charset

### 浏览器相关API

#### encodeURI
该方法对不符合URI规范的字符进行百分号编码，对应解码方法 `decodeURI`。

转义的字符有：第1种情况、第2种情况 和 `[`、`]`。

按照标准，方括号在 `ipv6` 中有特殊含义，不应该被转义，可以使用以下代码修复。
```js
function fixEncode(str) {
  return encodeURI(str).replace(/%5B/g, '[').replace(/%5D/g, ']');
}
```

#### encodeURIComponent
该方法对不符合HTTP URI 部件规范的字符进行百分号编码，对应解码方法 `decodeURIComponent`。HTTP URI 中 query 的部分 `&`、`=` 是有特殊含义的，所以需要用此函数来转码。

该方法不转义5个属于保留字符的字符有：`!`、`*`、`'`、`(`、`)`，为了更加安全规范建议可以自己转义。
```js
function safelyEncodeURIComponent(str) {
  return encodeURIComponent(str).replace(/[\!\*'\(\)]/g, escape('$0'));
}
```

关于 `appliaction/x-www-form-urlencode` 规定，`POST` 数据中空格需要被转成 +
```js
function spToPlus(str) {
  return safelyEncodeURIComponent(str).replace(/%20/g, '+');
}
```

## 用法

### Relative Reference
利用分层结构，可以省略之前的部件。对应上文提到的 [path](#path) 部分列出的其中4种情况。

- 1：与引用文档是使用相同 scheme 的关系
- 2.1：与引用文档是使用相同 scheme 和 authority 的关系，即常说的绝对路径
- 2.2：与引用文档有相对的关系，根据..、.来判断，即常说的相对路径

### Absolute URI
除去 fragment 部分的URI，称为base uri。

### Same-Document Reference
URI 合并后，如果与引用文档的 URI 对比后，fragment 之前的部分都相同，即为同文档引用。不会指向新的资源。

### Suffix Reference
比如 `www.w3.org/Addressing/`，这是偏向人类方便的用法。最终需要靠程序去猜测，因为 `www` 一般为 `http://` 开头，但不建议这么使用，因为不保证 scheme 是否会发送变化。

<br>

## 参考
- [rfc3986](https://tools.ietf.org/html/rfc3986)
- [encodeURIComponent, MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent)
- [encodeURI, MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/encodeURI)