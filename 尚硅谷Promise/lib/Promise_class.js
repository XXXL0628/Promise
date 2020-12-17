/*
自定义的Promise函数模块:IIFE
*/

//ES5语法
(function (window) {

    const PENDING = 'pending';
    const RESOLVED = 'resolved';
    const REJECTED = 'rejected';

    class Promise {
        //Promise构造函数
        //excutor:执行器函数(同步执行)
        constructor(excutor) {
            //将当前promise对象保存起来
            const self = this;
            self.status = PENDING; //给promise对象指定status属性，初始值为pending
            self.data = undefined;  //给promise对象指定一个用于存储结果数据的属性
            self.callbacks = [];  //每个元素的结构：{onResolved(){},onRejected(){}}
            function resolve(value) {
                //如果当前状态不是pending，直接结束
                if (self.status !== PENDING) {
                    return;
                }
                //将状态改为resolved
                self.status = RESOLVED;
                //保存value数据
                self.data = value;
                //如果由待执行的callback函数，立即异步执行回调函数onResolved
                if (self.callbacks.length > 0) {
                    setTimeout(() => { //放入队列中执行所有成功的回调
                        self.callbacks.forEach(calbacksObj => {
                            calbacksObj.onResolved(value)
                        });
                    });
                }

            }
            function reject(reason) {
                //如果当前状态不是pending，直接结束
                if (self.status !== PENDING) {
                    return;
                }
                //将状态改为rejected
                self.status = REJECTED;
                //保存value数据
                self.data = reason;
                //如果由待执行的callback函数，立即异步执行回调函数onRejected
                if (self.callbacks.length > 0) {
                    setTimeout(() => { //放入队列中执行所有成功的回调
                        self.callbacks.forEach(calbacksObj => {
                            calbacksObj.onRejected(reason)
                        });
                    });
                }
            }


            //立即同步执行excutor
            try {
                excutor(resolve, reject);
            } catch (error) { //如果执行器抛出异常，promise对象变为rejected状态
                reject(error);
            }

        }

        /* 
    Promise原型对象的then()
    指定成功和失败的回调函数
    函数的返回值为新的promise对象
    */
        then  (onResolved, onRejected) {

            onResvoled = typeof onResvoled === 'function' ? onResvoled : value => value; //向后传递成功的value
            //指定默认的失败的回调(实现错误/异常传透的关键点)
            onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }; //向后传递失败的reason

            const self = this;

            //返回一个新的Promise对象
            return new Promise((resolve, reject) => {

                /* 调用指定回调函数处理，根据执行结果，改变return的promise状态 */
                function handle(callback) {
                    /* 
                    1、如果抛出异常，return的promise就会失败，reason的值就是error
                    2、如果回调函数返回不是promise，return的promise就会成功，value就是返回的值
                    3、如果回调函数返回是promise，return的promise结果就是这个promise的结果
                    */
                    try {
                        const result = callback(self.data);
                        if (result instanceof Promise) {//如果回调函数返回是promise，return的promise结果就是这个promise的结果
                            // result.then(
                            //     // value => resolve(value), //当result成功时，让return的promise也成功
                            //     // /*等价于value=>{
                            //     //     resolve(value);
                            //     // },*/
                            //     // reason=> reject(reason)//当result失败时，让return的promise也失败

                            // )
                            //也等价于
                            result.then(resolve, reject);
                        } else {//如果回调函数返回不是promise，return的promise就会成功，value就是返回的值
                            resolve(result);
                        }
                    } catch (error) {//如果抛出异常，return的promise就会失败，reason的值就是error
                        reject(error);
                    }
                }

                if (self.status === PENDING) {
                    //假设当前状态还是pending状态，将回调函数保存起来
                    self.callbacks.push({
                        onResolved(value) {
                            handle(onResolved);
                        },
                        onRejected(reason) {
                            handle(onRejected);
                        }
                    })
                } else if (self.status === RESOLVED) {//如果当前是resolved状态，异步执行onResolve并改变return的promise状态
                    //立即异步执行成功的回调函数
                    setTimeout(() => {
                        handle(onResolved);
                    });
                } else { //rejected状态//如果当前是rejected状态，异步执行onReject并改变return的promise状态
                    setTimeout(() => {
                        handle(onRejected);
                    });
                }
            });

        }

        /* 
        promise原型对象的catch()
        指定失败的回调函数
        返回一个新的promise对象
        */
        catch (onRejected) {
            return this.then(undefined, onRejected);
        }

        /* Promise函数对象的resolve方法
            如果是一般值，promise成功，value就是这个值
            如果是成功的promise，p2成功，value是这个promise的value
            如果是失败的promsie，p3失败，reason是这个promise的reason
        返回一个指定结果的成功的promise
        */
        static resolve = function (value) {
            //返回一个promise（可能成功可能失败）
            return new Promise((resolve, reject) => {
                //value是promise
                if (value instanceof Promise) {
                    value.then(resolve, reject); //使用value的结果作为promise结果
                } else { //value不是promise => promise变为成功，数据是value
                    resolve(value);
                }
            })
        }
        /* Promise函数对象的reject方法
        返回一个指定失败的promise
        */
       static reject = function (reason) {
            //返回一个失败的promise
            return new Promise((resolve, reject) => {
                reject(reason);
            });
        }
        /* Promise函数对象的all方法
        返回一个promise，只有当所有promise都成功时才成功，否则只要有一个失败就失败
        */
       static all = function (promises) {
            const values = new Array(promises.length);//用来保存所有成功value的数组,且长度为promises的长度
            let resolveCount = 0; //用来保存成功promise的数量
            return new Promise((resolve, reject) => {
                //遍历获取每个promise的结果
                promises.forEach((p, index) => {
                    Promise.resolve(p).then(
                        value => {
                            resolveCount++; //成功的数量加1
                            //p成功了，将成功的vlaue保存vlaues
                            // values.push(value);
                            values[index] = value;

                            //如果全部成功了，将return的promise改变成功
                            if (resolveCount === promises.length) {
                                resolve(values);
                            }
                        },
                        reason => { //只要有一个失败了，return的promise就失败
                            reject(reason);
                        }
                    )
                })
            });
        }
        /* Promise函数对象的race方法 
        返回一个promise，其结果由第一个完成的promise决定
        */
       static race = function (promises) {
            //返回一个promise
            return new Promise((resolve, reject) => {
                //遍历promise获取每隔promise的结果
                promises.forEach((p, index) => {
                    Promise.resolve(p).then(
                        value => { //一旦有成功了，将return变为成功
                            resolve(value);
                        },
                        reason => {  //一旦又失败了，将return变为失败
                            reject(reason);
                        }
                    )
                })
            })
        }
        /* 
        返回一个promise对象，它在指定的事件后才确定结果
        */
       static resolveDelay = function (value, time) {
            //返回一个promise（可能成功可能失败）
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    //value是promise
                    if (value instanceof Promise) {
                        value.then(resolve, reject); //使用value的结果作为promise结果
                    } else { //value不是promise => promise变为成功，数据是value
                        resolve(value);
                    }
                }, time);
            })
        }
        /* 
         返回一个promise对象，它在指定的事件后才失败
         */
        static rejectDelay = function (reason, time) {
            //返回一个失败的promise
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    reject(reason);
                }, time);
            });
        }
    }




    //向外暴露Promise函数
    window.Promise = Promise;
})(window);