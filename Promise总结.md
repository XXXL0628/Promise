#  Promsie总结

## 基础知识要记牢

1. 函数对象和实例对象的区别(简单记法就是括号左边是函数对象，点的左边是实例对象)

    - 函数对象：将函数作为对象使用，简称为函数对象
    - 实例对象：new函数产生的对象，简称对象

2. 回调函数的分类

    - 同步回调
    - 异步回调

3. JavaScript的错误类型

    错误的类型

    ​      Error：所有错误的父类型

    ​      ReferenceError：引用的变量不存在

    ​      TypeError：数据类型不正确的错误

    ​      RangeError：数据值不在器所允许的范围内（递归未跳出）

    ​      SyntaxError：语法错误

    错误处理：

    ​      捕获错误：try...catch

    ​      抛出错误：throw error

    错误对象

    ​      message属性：错误相关信息

    ​      stack属性：函数调用栈记录信息

## Promise介绍

#### Promise是什么？

​    Promise是解决异步编程的新的东西（旧的是什么？---纯回调函数（代表只有回调函数，Promise里面也有回调函数））

​    从语法上说：Promise是一个构造函数

​    从功能上说：Promise对象用来封装一个异步操作并可以获取其结果

#### Promise的状态改变

​    Pending、resolved（fulfilled）、rejected

​    一个promise对象只能改变一次

​    无论变为成功还是失败，都会有一个结果数据

​    成功的结 果数据一般称为value，失败的结果数据一般称为reason

语法糖：就是简写方式，写起来很甜

## Promise关键问题

1、如何改变promise的状态

​      (1)resolve(value)----peding-->resolved

​      (2)reject(reason)----peding-->rejected

​      (3)抛出异常:如果当前是peding就会变为rejected

​        一般抛出error，但是从语法上说抛任何东西都可以



​    2、一个promise指定多个成功/失败回调函数，都会调用吗？

​      当promise改变为对应状态时都会调用



​    3、改变promise状态和指定回调函数谁先谁后？

​      (1)都有可能，正常情况下是先指定回调再改变状态，但也可以先改变状态再指定回调

​      (2)如何让先改状态再指定回调？

​        在执行器中直接调用resolve()/reject()

​        延迟更长时间才调用then()

​      (3)什么时候才能得到数据？

​        如果先指定的回调，那当状态发生改变时，回调函数就会调用，得到数据

​        如果先改变的状态，那当指定回调时，回调函数就会调用，得到数据

​    4、promise.then()返回的新promise的结果状态由什么决定？

​      (1)简单表达：由then()指定的回调函数执行的结果决定

​      (2)详细表达：

​        如果抛出异常，新promise变为rejected，reason为抛出的异常

​        如果返回的是非promise的任意值，新promise变为resolved，value为返回的值

​        如果返回的是另一个新promise，此promise的结果就会成为新promise的结果 

​    5、promise如何串联多个操作任务

​      (1)promise的then()返回一个新的promise，可以看成then()的链式调用

​      (2)通过then的链式调用串连多个同步/异步任务

​    6、promise异常传透

​    ----相当于是在then第二个参数填写了默认的`reason=>{throw reason}` 向下传递

​      (1)当使用promise的then链式调用时，可以在最后指定失败的回调

​      (2)前面任何操作出了异常，都会传到最后失败的回调中处理

​    7、中断promise链？

​      (1)当使用promise的then链式调用时，在中间中断，不再调用后面的回调函数

​      (2)办法：在回调函数中返回一个pending状态的promise对象

​      return new Promise(()=>{});

## 手写Promise

1. 先搭结构

    - 构造函数-参数为executor函数（同步回调，参数为两个函数resolve，reject）
    - Promise.prototype.then----对象的方法
    - Promise.prototype.catch----对象的方法
    - Promise.resolve、Promise.reject、Promise.all、Promise.race----函数对象方法
    - window.Promise=Promise;  //将window内置的Promise覆盖
    - 如果写成IIFE函数，那么在构造器函数后紧跟(window)

2. 首先将promise的三个状态保存为常量

3. 每个Promise都先将当前状态保存，再保存他的值，还得建一个数组存放回调函数

4. 写好then方法，大致其他的方法都会出来

5. then方法注意事项

    - 返回一个新的Promise对象
    - 调用then方法时需要判断一下传入then的是不是一个方法，如果是值，则直接将值传给下一层，如果是错误，则将错误直接抛给下一层

    ```js
    onResvoled = typeof onResvoled === 'function' ? onResvoled : value => value; //向后传递成功的value
    //指定默认的失败的回调(实现错误/异常传透的关键点)
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }; //向后传递失败的reason
    ```

    - 在进行处理程序函数调用之前先判断传入的promise状态
        - pending---就将回调函数保存起来，因为现在还不知道状态，两种方法都要保存起来等待调用
        - resolved----立即异步执行成功的回调函数
        - rejected----立即异步执行失败的回调函数

6. catch方法就直接调用then方法，只是将传入的第一个参数写为null或者undefined即可

7. resolve/reject方法  

    - resolve方法返回一个指定结果成功的Promise
    - reject方法返回一个指定结果失败的Promise

8. all/race方法

    - 注意传入的不一定是promise，所以在遍历时，将每一个遍历的值都封装在一个新的Promise.resolve()方法中

    - all方法就是要注意使用一个新的传入的promises长度的数组保存依次成功的返回值，同时顺序还得是传入的顺序，所以需要保存传入的index，使用当前index保存结果
    - race方法只需要依次遍历传入的数组，第一个完成的promise决定
    - 因为promise的状态只能改变一次，后续的结果并无影响

## async和await

- 注意事项
    - 就是await必须写在async函数中，但async函数中可以没有await
    - await只能得到成功的结果，如果await的promise失败了，需要通过try...catch来捕获异常

1、async函数

​      函数的返回值为promise对象

​      promise对象的结果由async函数执行的返回值决定

2、await表达式

​      await右侧的表达式一般为promise对象，但也可以是其他的值

​      如果表达式是promise对象，await返回的是promise成功的值

​      如果表达式是其他值，直接将此值作为await的返回值

## 宏队列与微队列

Js引擎先执行初始化同步代码，再将宏微任务按照一定的顺序执行

执行宏任务之前一定会把当前微任务队列全部清空再执行，而如果当前宏任务中又有微任务，会将微任务再排在微队列后

eg：

~~~js
setTimeout(() => {
    console.log("0");
}, 0);
new Promise((resolve,reject)=>{
    console.log("1");
    resolve();
}).then(()=>{
    console.log("2");
    new Promise((resolve,reject)=>{
        console.log("3");
        resolve();
    }).then(()=>{
        console.log("4");
    }).then(()=>{
        console.log("5");
    });
}).then(()=>{
    console.log("6");
});
new Promise((resolve,reject)=>{
    console.log("7");
    resolve();
}).then(()=>{
    console.log("8");
})

~~~

解析：

1. 开始先将定时器放入宏队列中[0]

    - ```
        宏:[0]
        微:[]
        ```

2. 执行到同步代码输出1，然后执行resolve方法，该Promise状态成功，调用then，then里面的函数为异步执行，放入微队列[2]

    - ```
        结果：1 
        同步代码输出1
        宏:[0]
        微:[2]
        ```

3. <u>后面的一系列代码都不会执行</u>(因为调用2的那个then里面都是回调函数内容一起存放微队列)，紧跟的then因为得不到上面的状态无法调用，放入缓存中，接下来执行到同步代码输出7

    - ```
        结果：1 7 
        同步代码输出7
        宏:[0]
        微:[2]
        ```

4. resolve()方法调用then，then回调函数放入为微队列，

    - ```
        结果：1 7 
        宏:[0]
        微:[2,8]
        ```

5. 此时所有初始化代码都执行完毕，在执行宏任务之前需要将微任务队列清空，所以输出2，微队列此时为[8],

    - ```
        结果：1 7 2
        宏:[0]
        微:[8]
        ```

6. 输出2的同时，执行同步代码输出3，后面紧跟resolve()，放入微队列,此时为[8,4],并且此时4后面的then回调函数并不会执行，而是等待4执行完毕更改状态之后再进入微队列

    - ```
        结果：1 7 2 3
        同步输出3
        宏:[0]
        微:[8,4]
        ```

7. 完成2的微任务后，调用缓存中的6那个then，放入微队列[8,4,6]

    - ```
        结果：1 7 2 3
        宏:[0]
        微:[8，4，6]
        ```

8. 接下来进行8，微任务为[4,6]，

    - ```
        结果：1 7 2 3 8
        宏:[0]
        微:[4，6]
        ```

9. 然后执行4,传给5的状态改变，调用then的回调函数，将5存入微队列，此时为[6,5]

    - ```
        结果：1 7 2 3 8 4
        宏:[0]
        微:[6，5]
        ```

10. 然后执行6，执行5，最后输出0(宏任务在微队列清空之后执行)，结果为1，7，2，3，8，4，6，5，0

    - ```
        结果：1 7 2 3 8 4 6 5 0
        宏:[]
        微:[]
        ```

        

