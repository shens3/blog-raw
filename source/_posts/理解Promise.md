---
title: 理解Promise
date: 2020-04-02 14:22:59
urlname: learn-promise
tags: [promise]
categories:
- js
---

## 问题

业务流程：先后顺序或则无顺序。

- 回调地域：本质就是需要链式执行异步操作
- 等待全部执行：需要等待一系列异步操作完成后才能进行一下步的操作
- 只需某个操作成功：只取其中一个结果

## 解决思路

需要：
- 执行与回调处理解耦
- 可以将判断一系列顺序无关的异步任务的逻辑封装成方法

## Promise
Promise 就是做了以上事情的一个工具。

### 如何解耦
简单的代码实现：
```js
function Promise(executor) {
  this.onFulfilledCallbacks = [];
  this.onRejectedCallbacks = [];
  this.status = 'pending';
  this.value = undefined;

  let self = this;

  function resolve(value) {
    if (self.status === 'pending') {
      self.status = 'fulfilled';
      self.value = value;
      setTimeout(() => {
        self.onFulfilledCallbacks.forEach((fn) => {
          fn(value);
        });
      }, 0)
    }
  }

  function reject(reason) {
    if (self.status === 'pending') {
      self.status = 'rejected';
      self.value = reason;
      setTimeout(() => {
        self.onRejectedCallbacks.forEach((fn) => {
          fn(reason);
        });
      }, 0)
    }
  }

  executor(resolve, reject);
}

Promise.prototype.then = function(onFulfilled, onRejected) { // 注册回调函数
  let status = this.status;
  if (status === 'pending') { // 如果状态为 pending，将回调存起来
    this.onFulfilledCallbacks.push(onFulfilled);
    this.onRejectedCallbacks.push(onRejected);
  } else if (status === 'fulfilled') { // 如果状态为 fulfilled，执行成功的回调
    setTimeout(() => {
      onFulfilled(this.value);
    }, 0);
  } else if (status === 'rejected') { // 如果状态为 rejected，执行成功的回调
    setTimeout(() => {
      onReonRejectedject(this.value);
    }, 0) 
  }

  return this;
}
```

一般的观察者模式，"通知"这个功能是由<span style="color: red">被观察者</span>来提供的，比如课程类（被观察者），可以有一个方法来通知学生类（观察者）上课了。但对于我们要解决的问题来说，<span style="color: red">被观察者</span>不是一个功能复杂的类，只是一个任务或者一个过程，只需要执行，所以"通知"这个接口设计在<span style="color: red">观察者</span>上。对于<span style="color: red">观察者</span>来说，这个接口是一个"被通知"的作用，给<span style="color: red">被观察者</span>来主动"通知"。显然的，这个接口就是执行函数中被 Promise 传入的两个函数 `resolve` 和 `reject`。

有了通知，还需要设计<span style="color: red">观察者</span>的处理函数要怎么执行。一般来说，观察者观察是有目的的，比如说当课程类通知学生类上课了，学生类就需要执行"去上课"这个动作。对于 Promise 来说，它是一个**通用的观察者**，它只需要收集需要执行的动作，并且在对的状态下执行这些动作。`then` 方法就是做这些事的。

<span style="color: red">被观察者</span>执行通知成功 `resolve` 这个方法，可以是同步也可以是异步。但收集动作这个方法是在执行任务之后才执行的，所以当 `resolve` 被同步执行了，即 <span style="color: red">观察者</span> 被通知发生了变化。一般来说，通知这个接口内部会执行<span style="color: red">观察者</span>需要执行的动作，但这时候then还未执行，也就是说，Promise 还不知道有什么动作可以执行。所以为了确保同步任务下，收集的动作也能被执行，就需要在收集的时候查看任务是否已经结束，如果已经结束就应该执行对应结束状态的函数；如果还没结束，说明是异步任务，放入数组中存储，"被通知"后再执行。

异步代码打印一个3，
```js
console.log(1);

setTimeout(() => {
  console.log(3);
});

console.log(2);
```
使用 Promise 后，

```js
new Promise((resolve) => {
  console.log(1)
  setTimeout(() => {
    resolve(3);
  }, 0);
}).then((value) => {
  console.log(value);
})

console.log(2);
```

输出都为`1 2 3`。包装之后，异步操作的原生回调处理函数中不再直接是相关的处理逻辑代码，而是使用 `Promise` 提供的 `resolve` 和 `reject` 来代替。相关的处理逻辑将会放到 `then` 方法中传入，这样就实现了解耦。数据的传递不难理解。

### 如何链起来
单单解耦看起来没什么用，到目前为止也只能是单个异步任务的执行与回调处理分开了，还是没有解决多个异步任务需要按顺序执行的需求。Promise 能让异步执行起来更优雅的方法在于，`then` 方法返回一个 Promise，并且这个 Promise "观察"了 `onFulfilled` 和 `onRejected` 的返回值，可以理解为，`onFulfilled` 和 `onRejected` 的返回值是一个新的任务。

```js
function resolvePromise(p2, x, resolve, reject) {
  if (x === p2) throw TypeError();

  if (x !== null && typeof x === 'object') { // 如果 x 是一个 Promise
    try {
      let then = x.then;
      let called = false; // 确保传入 then 的两个函数只被执行了其中一个，并且只执行了一次
      if (then && typeof then === 'function') {
        then.call(x, y => {
          if (!called) {
            called = true;
            resolvePromise(p2, y, resolve, reject); // 如果 x 执行的函数 resolve 了一个 Promise
          }
        }, err => {
          if (!called) {
            called = true;
            reject(err);
          }
        })
      }
    } catch(err) {
      reject(err);
    }
  } else {
    resolve(x);
  }
}

Promise.prototype.then = function(onFulfilled, onRejected) {
  let self = this;
  let status = self.status;
  let value = self.value;

  let promise2  = new Promise(function(resolve, reject) {
    if (status === 'pending') {
      self.onFulfilledCallbacks.push((v) => {
        try {
          resolvePromise(promise2, onFulfilled(v), resolve, reject);
        } catch(err) {
          reject(err);
        }
      });
      self.onRejectedCallbacks.push((v) => {
        try {
          resolvePromise(promise2, onRejected(v), resolve, reject);
        } catch() {
          reject(err);
        }
      });
    } else if (status === 'fulfilled') {
      setTimeout(() => {
        try {
          resolvePromise(promise2, onFulfilled(value), resolve, reject);
        } catch(err) {
          reject(err);
        }
      }, 0);
    } else if (status === 'rejected') {
      setTimeout(() => {try {
          resolvePromise(promise2, onRejected(value), resolve, reject);
        } catch(err) {
          reject(err);
        }
      }, 0) 
    }
  });

  return promise2;
}
```
`promise2` 的状态于 `onFulfilled` 或 `onRejected` 的返回值 `x` 有关：

- 如果 `x` 的值不是一个 Promise，`promise2` 的状态为 `fulfilled`，并且 `value` 值为 `x`
- 如果 `x` 的值是一个 Promise，`promise2` 的状态为 `x` 最终的状态

### 控制无顺序要求的任务
既然解耦了，就可以使用 Promise 提供一个方法，内部添加处理函数实现判断一系列任务是否完成。

```js
Promise.all = function(array) {
  return new Promise((resolve, reject) => {
    let result = [];
    let count = array.length;
    let n = 0;
    array.forEach((promise, i) => {
      if (promise !== null && typeof promise === 'object' && typeof promise.then === 'function') {
        promise.then(value => { // 做一个计数
          result[i] = value;
          n++;
          if (count === n) resolve(result);
        }, err => {
          reject(err);
        });
      } else {
        result[i] = value;
      }
    });

    if (count === n) resolve(result);
  });
}
```

### 总结

- 观察者模式
- 回调
- 递归

## 如何使用

- 每一个promise只执行一个异步任务
- 借助链式传递结果，而不是嵌套

## 参考
- [Promises/A+](https://promisesaplus.com/)