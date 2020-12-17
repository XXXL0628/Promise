// setTimeout(() => {
//     console.log(1);
// }, 0);
// Promise.resolve().then(()=>{
//     console.log(2);
// });
// Promise.resolve().then(()=>{
//     console.log(4);
// });
// console.log(3);

//------------------------------------
// setTimeout(() => {
//     console.log(1);
// }, 0);
// new Promise((resolve) => {
//     console.log(2);
//     resolve();
// }).then(() => {
//     console.log(3);
// }).then(() => {
//     console.log(4);  //4不会跟着3一起放入微队列中，执行完3，状态成功调用4，才改变了4接收的状态才会将4放入微队列中
// });
// console.log(5);

//-----------------------------

// const first = () => (new Promise((resolve, reject) => {
//     console.log(3);
//     let p = new Promise((resolve, reject) => {
//         console.log(7);
//         setTimeout(() => {
//             console.log(5);
//             resolve(6); //因为下面resolve1已经改变p的状态，只能改变一次，所以这个没有作用
//         }, 1000);
//         resolve(1);
//     });
//     resolve(2);
//     p.then((arg) => {
//         console.log(arg);
//     });
// }))

// first().then((arg) => {
//     console.log(arg);
// })
// console.log(4);

//---------------------------
/* 
宏：[0]
微：[]
*/

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