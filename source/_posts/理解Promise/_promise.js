function Promise(executor) {
  this.onFulfilledCallbacks = [];
  this.onRejectedCallbacks = []
  this.status = 'pending';
  this.value = undefined;

  let self = this;

  function resolve(value) {
    if (self.status === 'pending') {
      self.status = 'fulfilled';
      self.value = value;
      self.onFulfilledCallbacks.forEach((fn) => {
        fn(value);
      });
    }
  }

  function reject(reason) {
    if (self.status === 'pending') {
      self.status = 'rejected';
      self.value = reason;
      self.onRejectedCallbacks.forEach((fn) => {
        fn(reason);
      });
    }
  }

  executor(resolve, reject);
}

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
        resolvePromise(promise2, onFulfilled(v), resolve, reject);
      });
      self.onRejectedCallbacks.push((v) => {
        resolvePromise(promise2, onRejected(v), resolve, reject);
      });
    } else if (status === 'fulfilled') {
      setTimeout(() => {
        resolvePromise(promise2, onFulfilled(value), resolve, reject);
      }, 0);
    } else if (status === 'rejected') {
      setTimeout(() => {
        resolvePromise(promise2, onRejected(value), resolve, reject);
      }, 0) 
    }
  });

  return promise2;
}

Promise.all = function(array) {
  return new Promise((resolve, reject) => {
    let result = [];
    let count = array.length;
    let n = 0;
    array.forEach((promise, i) => {
      if (promise !== null && typeof promise === 'object' && typeof promise.then === 'function') {
        promise.then(value => {
          result[i] = value;
          n++;
          if (count === n) resolve(result);
        }, err => {
          reject(err);
        });
      } else {
        n++;
        result[i] = promise;
      }
    });

    if (count === n) resolve(result);
  });
}
Promise.all([
  1,
  new Promise((rs, rj) => {
    setTimeout(() => rs(2), 0)
  }),
  new Promise((rs, rj) => {
    setTimeout(() => rs(3), 1)
  }),
]).then(value => {
  console.log(value)
})