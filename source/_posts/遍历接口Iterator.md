---
title: 遍历接口Iterator
date: 2020-04-05 14:17:59
urlname: iterator
tags:
categories:
- [js]
---

## 统一遍历接口
数据遍历的统一接口，即不同的数据结构都可以用统一的方式遍历数据。`Iterator` 为迭代器，满足迭代器协议。迭代器是一个对象，有 `next` 方法，每执行一次 `next` 方法都会返回一个迭代结果对象 `IteratorResult`。迭代结果对象有两个属性，`value` 表示当前迭代的数据，`done` 表示迭代是否结束。以下为 Typescript 的定义：

```js
interface Iterator {
  next(value?: any): IteratorResult
}

interface IteratorResult {
  value: any,
  done: boolean
}
```

实现一个可对数组迭代的迭代器。

```js
function makeIterator() {
  let self = this;
  let index = 0;
  let len = self.length;
  return {
    next: function() {
      return index < len ?
        { value: self[index++], done: false } :
        { value: undefined, done: true };
    }
  }
}

Array.prototype.iterator = makeIterator;

let a = [1, 2, 3];

let it = a.iterator();

console.log(it.next()); // { value: 1, done: false }
console.log(it.next()); // { value: 2, done: false }
console.log(it.next()); // { value: 3, done: false }
console.log(it.next()); // { value: undefined, done: true }
```
迭代器一般由一个函数生成。如果一个对象拥有一个可以生成迭代器的实例方法，那么这个对象称为 `Iterable`。比如，上述代码中 Array 的原型上添加了可以生成一个迭代器的方法，所以可以称数组的实例都是可迭代的。在 js 中这个实例方法必须为 `[Symbol.iterator]`。 `Iterable` 的 Typescript 定义：

```js
interface Iterable {
  [Symbol.iterator](): Iterator
}
```

## 实现
js 中原生可迭代的对象有：

- Array
- Set
- Map
- String
- TypedArray
- NodeList
- arguments

js 中原生返回迭代器的方法有 Array、Set、Map 对象的：

- keys()：表示对键值的迭代，没有键值则引用 values()
- values()：表示对值的迭代
- entries()：表示对键值对的迭代，一个键值对用数组表示，`[key, value]`

实际上 Set.prototype[Symbol.iterator] 引用的就是的 Set.prototype.values()，而 Map.prototype[Symbol.iterator] 引用的是 Map.prototype.entries()。这里要理解 keys 和 values 和 entries 代表的含义，和每种数据结构的组成，以及迭代在数据结构上的变现。

Array 有键有值；Set 没键有值；Map 有键有值。

## 使用迭代器接口遍历
上述迭代器的列子是手动一次次调用 `next` 来实现迭代，非常麻烦。需要正确使用迭代器接口。

### 自己遍历
实现一个迭代函数，迭代上面定义的数组 `a`。

```js
function iterate(iterable, cb) {
  let it = this.iterator();
  let result = it.next();

  while(!result.done) {
    cb(result.value);
    result = it.next();
  }
}

iterate(a, i => console.log(i)); // 1 2 3
```

### 原生遍历
自己写遍历函数还是很麻烦，原生提供了一种语法专门调用迭代器接口进行迭代，即 `for...of`。`of` 后面可以是

- Iterable
- Iterator
  
```js
let a = [1, 2, 3];
for(let item of a) {
  console.log(item); // 1 2 3
}

for(let [k, v] of a.entries()) {
  console.log(v); // 1 2 3
}
```

使用`for...of`的优点：
- 支持 break、continue、return
- 与数据类型无关
- 语法简洁

值得注意的是，除了 `for...of`，es6 新增的语法和方法中也有一些内部调用了迭代器接口。比如，扩展运算符、解构赋值、yield*等。

> 扩展运算符也可以用于普通对象

## 最后的思考
总的来说，可遍历就意味数据的顺序是确定的。Array、Set、Map 使用添加数据的方法时就可以确定顺序，而一个对象是没有办法确定其属性的顺序的。也不难理解 Set、Map 构造函数需要接受可迭代对象，如果可以接收一个普通对象，那么这个数据的顺序还是无法确定。记得可以多使用 `for..of`。

## 参考
- [Iterator 和 for...of 循环, 阮一峰](https://es6.ruanyifeng.com/#docs/iterator)

