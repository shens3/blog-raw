---
title: 初识 Web Component
date: 2020-04-15 14:28:39
urlname: learn-about-web-component
tags: [web-component]
categories:
- [web]
---

## Web Component 初印象

总是在 MDN 文档上瞄到到 Web Component 的文章介绍，一直很好奇原生的网页组件跟我们平时在各个框架中写的组件有什么不同，实现原理是什么。花了些时间阅读了这些文档，算是个初步入门吧。

Web Component 主要使用到了三个技术，

- Custom Element（自定义元素）
- Shadow DOM（影子节点）
- Template （HTML 模板）

> 其实还有一个 [HTML Imports](https://www.html5rocks.com/en/tutorials/webcomponents/imports/)，但是 Chrome 已经将其废弃。

## Custom Element 自定义元素

想要扩展原生 HTML 元素，封装自己的逻辑，使用自定义元素是一个很好的方法。自定义元素继承自原生 DOM，可以使用本来有的接口，还可以定义自己的逻辑。简单实现一个回到顶部的按钮。

```js
class BackToTop extends HTMLElement {
  constructor() {
    super();
    this.style.cssText = `
      position: fixed;
      width: 30px;
      height: 30px;
      line-height: 30px;
      border-radius: 50%;
      bottom: 10px;
      right: 20px;
      background: #efefef;
      text-align: center;
      font-size: 12px;
      color: #fff;
    `;

    this.innerHTML = 'top';

    this.addEventListener('click', this.toTop);
  }

  toTop() {
    window.scrollTo({ 
      top: 0, 
      behavior: "smooth" 
    });
  }
}
```

定义一个自定义元素使用 es2015 的类语法，继承 `HTMLElement` 类，这是使得自定义元素可以使用原生 DOM 接口的原因。要在文档中使用自定义元素，必须得注册，但是这这两步的顺序不是必须固定的。

```html
<!-- 在 html 中使用 -->
<back-to-top></back-to-top>
```

```js
// 注册自定义元素
customElement.define('back-to-top', BackToTop);
```

自定义元素规定注册的名字必须有中划线（-），以此来区分原生 HTML 元素。自定义元素可以在定义注册之前使用，这一过程称为**元素升级**。`customElements.whenDefined()` 可以得知元素确定被注册。

```js
customElement.whenDefined('back-to-top').then(() => {
  console.log('back-to-top 已注册');
});
```

除了继承 `HTMLElement`，还可以继承一些其他的原生元素的类。比如回到顶部这个元素应该是属于 `button`，并且希望在滚动时应该禁用这个按钮，通过继承 `HTMLButtonElement`，就可以复用原生 `button` 的 `disabled` 属性而不需要自己再实现。

```js
class BackToTop extends HTMLButtonElement {
  // ...
}
```

扩展原生 HTML 元素在注册和使用上有稍微的不同。`customElement.define()` 的第三个参数需要告诉浏览器该元素是继承自 button 元素，并且使用时是在原来的标签上使用 `is` 属性指定元素的注册名字。

```js
customElement.define('back-to-top', BackToTop, { extends: 'button' });
```

```html
<button is="back-to-top"></button>
```

### 自定义元素响应

自定义元素可以定义特殊的生命周期钩子，称为**自定义元素响应**。注意这些回调函数都是同步的。

- connectedCallback：元素每次插入到 DOM 时都会调用
- disconnectedCallback：元素每次从 DOM 中移除时都会调用
- attributeChangedCallback(attrName, oldVal, newVal)：属性添加、移除、更新或替换，仅 `observedAttributes` 属性中列出的特性才会收到此回调
- adoptedCallback：自定义元素被移入新的 `document`

### 自定义元素的内容

有时候一个组件会有比较复杂的 HTML 结构，那么在自定义元素中如何定义这些结构呢，可能你会这么想，将 HTML 标签结构直接赋值给该元素的 `innerHTML`。

```js 
class MessageBox extends HTMLElement {
  constructor(msg) {
    super();
    this.innerHTML = `
      <div>${msg}</div>
    `;
  }
}
```

虽然这并不是不可以，但是还有更好的办法，而且这必须保证使用是标签内部不能传入值，比如 `<message-box>content</message-box>` 元素就不能正常工作了。并且组件内部的样式还是会受全局定义的样式影响。更好的办法就是使用 Shadow DOM。

## Shadow DOM 影子节点

Shadow DOM 可以：

- 隔离 DOM：组件的 DOM 是独立的（例如，`document.querySelector()` 不会返回组件 shadow DOM 中的节点）。
- 作用域 CSS：shadow DOM 内部定义的 CSS 在其作用域内。样式规则不会泄漏，页面样式也不会渗入。
- 组合：为组件设计一个声明性、基于标记的 API。
- 简化 CSS：作用域 DOM 意味着您可以使用简单的 CSS 选择器，更通用的 id/类名称，而无需担心命名冲突。
- 效率：将应用看成是多个 DOM 块，而不是一个大的（全局性）页面

### 相关概念

图片来自[MDN](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM)

{% asset_img shadow-dom.png shadow-dom %}

- Shadow host：一个常规 DOM节点，Shadow DOM 会被附加到这个节点上。
- Shadow tree：Shadow DOM内部的 DOM 树。
- Shadow boundary：Shadow DOM 结束的地方，也是常规 DOM 开始的地方。
- Shadow root: Shadow tree 的根节点。

### 使用 Shadow DOM

Shadow DOM 并不是只能在自定义元素中使用，但是一般都与自定义元素结合使用。

```js
class MessageBox extends HTMLElement {

  constructor(msg, type) {
    super();

    const root = this.attachShadow({ mode: 'open' }); // 绑定一个 Shadow DOM
    root.innerHTML =  `
      <div>${msg}</div>
    `;
  }
}
```

`mode` 参数的作用是，是否将 `root` 挂到元素的属性 `shadowRoot` 上。这个参数会影响外部对影子节点的访问性。

> 传入 `mode: closed` 可以创建一个闭合的节点，但这并不意味着这个 shadow dom 是安全的，可参考 [Open vs. Closed Shadow DOM](https://blog.revillweb.com/open-vs-closed-shadow-dom-9f3d7427d1af)。

```js
let root = this.attachShadow({ mode: 'open' });
console.log(this.shadowRoot) // [root]

let root = this.attachShadow({ mode: 'closed' });
console.log(this.shadowRoot) // null
```

### 设置样式

提供了许多有用的 CSS 选择器来匹配元素，以下选择器还包括对 slot、自定义元素的选择。

- :host - 对 shadow host 节点生效，但外部的优先级更高
- :host(\<selector\>) - 对 shadow host 节点生效，可结合其他选择器使用
- :host-context(\<selector\>) - 对 shadow host 节点生效，可结合任意父级选择使用，比如 `:host-content(.box)` 等效于 `.box :host`
- ::slotted(\<selector\>) - 在 shadow dom 内部使用，可匹配符合条件的外部传入的slot，但仅限顶层元素
- :defined - 选择已"升级"的自定义元素

还可以外部使用 [CSS 自定义属性](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)给内部使用，相当于组件提供给外部的一个接口。

```css
.message-box {
  --info-bg-color: #BFBFBF;
}

/* 内部 */
:host([data-type=info]) {
  backgroud: var(--info-bg-color, #9E9E9E);
}
```

## Template 和 Slot

可以使用模板来初始化 Shadow Dom。

```html
<template id="message-box">
  <slot name="msg"></slot>
</template>

<script>
class MessageBox extends HTMLElement {
  constructor(msg) {
    super();
    let root = this.attachShadow({ mode: 'open' });

    root.appendChild(document.querySelector('#message-box').content.cloneNode(true));
  }
}
</script>
```
可以使用在 Shadow Dom 中使用 Slot 来声明一个占位元素，与外部元素组合。外部元素通过指定 slot 属性来匹配内部定义的 Slot，浏览器最终会渲染到正确的位置上，一个 Slot 可以匹配多个元素。

```html
<!-- 定义 -->
<template>
  <slot name="msg"></slot>
</template>

<!-- 使用 -->
<message-box>
  <span slot="msg">hello</span>
  <span slot="msg">world</span>
</message-box>
```

还有一些关于 slot 元素的接口：

- element.assignedSlot()：获取这个元素在 Shadow Dom 中对应的 slot
- slot.assignedNodes(options)：获取这个 slot 匹配到的元素数组
- sortchange 事件：可以理解为 `slot.assignedNodes(options)` 数组长度发送变化时触发的事件

## Web Component 不是框架
Web Component 是浏览器提供的一套原生接口，用来封装在页面中可复用模块代码，并且提供了封闭的作用域。但对于构建一个复杂的 Web 应用，只实现组件是不够的，所以可以结合现在的一些流行框架使用，比如 [React](https://zh-hans.reactjs.org/docs/web-components.html)、Vue。使用 Web Component 的好处是它对任何框架都可以兼容，因为它实际上就是原生的 DOM 元素。但是流行框架本身也提供了实现组件的方式，还能方便的处理数据渲染，想想似乎也没有必要再使用 Web Component。但是一些大型网站都已经在使用 Web Component 了，比如 YouTube、Google等。或许这确实能解决一个通用组件库需要用多种种技术框架来实现相同的逻辑的痛。

## 参考
- [Shadow DOM v1：独立的网络组件](https://developers.google.com/web/fundamentals/web-components/shadowdom)
- [自定义元素 v1：可重用网络组件](https://developers.google.com/web/fundamentals/web-components/customelements)
- [Web Components - MDN](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [Web Components: The Secret Ingredient Helping Power The Web](https://www.youtube.com/watch?v=YBwgkr_Sbx0)