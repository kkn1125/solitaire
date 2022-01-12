// const valid = [
//     [
//         {suit: 'spades', deno: 13},
//         {suit: 'hearts', deno: 12},
//         {suit: 'spades', deno: 11},
//         {suit: 'diamonds', deno: 10},
//         {suit: 'clubs', deno: 9},
//     ],
//     [
//         {suit: 'clubs', deno: 13},
//         {suit: 'diamonds', deno: 12},
//         {suit: 'clubs', deno: 11},
//         {suit: 'hearts', deno: 10},
//     ],
//     [
//         {suit: 'hearts', deno: 13},
//         {suit: 'clubs', deno: 12},
//         {suit: 'diamonds', deno: 11},
//         {suit: 'clubs', deno: 10},
//     ],
//     [
//         {suit: 'diamonds', deno: 13},
//         {suit: 'spades', deno: 12},
//         {suit: 'hearts', deno: 11},
//         {suit: 'spades', deno: 10},
//         {suit: 'hearts', deno: 9},
//     ],
//     [
//         {suit: 'spades', deno: 9},
//     ],
//     [
//     ],
//     [
//         // {suit: 'diamonds', deno: 9},
//     ],
// ];

// let card = [9, 10, 11, 12, 13];
// let suit = ['spades', 'clubs', 'hearts', 'diamonds'];

// console.log(valid);

// let validStack = [
//     [
//         // {suit: 'spades', deno: 8}
//     ],
//     [
//         // {suit: 'clubs', deno: 8}
//     ],
//     [
//         // {suit: 'hearts', deno: 8}
//     ],
//     [
//         // {suit: 'diamonds', deno: 8}
//     ],
// ]

// checkAutoComplete();

// function checkAutoComplete() {
//     const copyValid = [...valid];
//     let idx = 0;
//     let noStackCount = 0;
//     while(copyValid.filter(col=>col.length>0).length > 0){
//         if(idx==7){
//             idx = 0;
//         }

//         const col = copyValid[idx];
//         const last = col[col.length-1];
//         if(col.length==0) {
//             idx++;
//             // continue;
//         } else {
//             const suitId = suit.indexOf(last.suit);
//             const stackLast = validStack[suitId].slice(-1).pop()
//             if(last.suit == stackLast.suit && last.deno == stackLast.deno+1){
//                 console.log(`쌓기 ${last.deno}|${last.suit} -> ${stackLast.deno}|${stackLast.suit}`);
//                 validStack[suitId].push(col.pop());
//                 noStackCount = 0;
//             } else {
//                 noStackCount += 1;
//             }
//             idx++;
//         }

//         if(noStackCount>6){
//             console.log('스택 중지')
//             break;
//         }
//     }
// }
// console.log(validStack)
