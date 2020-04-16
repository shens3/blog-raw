function makeIterator() {
  let self = this;
  let index = 0;
  let len = self.length;
  return {
    next: function() {
      return index < len ? { value: self[index++], done: false } : { value: undefined, done: true };
    }
  }
}

Array.prototype.iterator = makeIterator;

function forOf(cb) {
  let it = this.iterator();
  let value, done;
  let next = it.next();
  done = next.done;
  value = next.value;

  while(!done) {
    cb(value);
    next = it.next();
    done = next.done;
    value = next.value;
  }
}

Array.prototype.forOf = forOf;

function iterator(next) {
  if (next.done) return;
  console.log(next.value);
  iterator(it.next())
}

let a = {
  a: 1,
  b: 2,
  c: 3,
  [Symbol.iterator]: function() {
    let index = 0;
    let key = ['a', 'b', 'c'];
    let len = key.length;
    let self = this;
    return {
      next: function() {
        return index < len ? { value: [key[index], self[key[index++]]], done: false } : { value: undefined, done: true }
      }
    }
  }
}

let b = new Set([1, 2, 3]);

function fakeIterator() {
  let index = 0;
  let obj = Object.create([][Symbol.iterator]().__proto__); // 会判断是不是 Iterator 的实例
  obj.next = function() {
    return index < 3 ? { value: index++ } : { done: true }
  }
  return obj;
}

function* fakeIterator1(obj) {
  for(let key of Object.keys(obj)) {
    yield [key, obj[key]];
  }
}

let it = fakeIterator1({ a: 1, b: 2, c: 3 });

for(let item of fakeIterator()) {
  console.log(item);
}

// generator
let c = [1, 2, 3];
c[Symbol.iterator] = function* generator() {
  for(let i = 0; i < this.length; i++) {
    yield this[i]; 
  }
}


for(let item of c) {
  console.log(item);
}
