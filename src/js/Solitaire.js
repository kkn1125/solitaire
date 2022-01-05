/**
 * Vue 비슷무리한 기능
 * 1. component 구현
 *  - 데이터 자동 바인딩
 *  - {{ ... }} 구문 사용
 *  - render의 인자 값은 항상 오브젝트로 할 것
 * 
 * [솔리테어 구현]
 * # 카드 - ✅
 * 1. 총 52장이고, spades, clubs, hearts, diamonds 총 4가지 타입마다 13장씩 사용
 * 
 * # 게임
 * ## 형식
 * 1. 크게 3가지로 분류 - ✅
 *  - 뽑는 카드 덱
 *  - 쌓는 카드 덱
 *  - 나열된 카드 덱 7*7 사이즈고 7 등차수열로 쌓여짐
 * 
 * 2. 뽑는 카드 덱
 *  - 뽑을 때마다 쌓임
 *  - 제일 마지막에 뽑은 카드만 사용할 수 있다.
 * 
 * 3. 쌓는 카드 덱 - ✅
 *  - spades, clubs, hearts, diamonds 총 4가지로 쌓임
 *  - 
 * 
 * ## 규칙
 * 1. spades, clubs은 검정, hearts, diamonds는 빨강
 * 2. 검정과 빨강을 교차해서 카드를 쌓아 나간다. 이때 검정|빨강 끼리를 불가하다.
 * 3. 쌓는 덱이 비어있으면 순차적으로 바로 올릴 수 있다.
 * 4. 쌓는 덱의 마지막 카드 다음의 카드가 있다면 바로 올릴 수 있다.
 */

import {
    SCard,
    SStacking
} from './components/SCard.js';
import {
    SGround
} from './components/SGround.js';

(function () {
    function Controller() {
        let models = null;

        this.init = function (model) {
            models = model;

            this.renderCardDekcs();
            window.addEventListener('click', this.handleCardMove);
            window.addEventListener('click', this.handleGetCardInStores);
            window.addEventListener('click', this.handleCardPick);
            window.addEventListener('click', this.handleCardEachFace);
        }

        this.renderCardDekcs = function () {
            models.renderCardDekcs();
        }

        this.handleCardEachFace = function(ev){
            const handle = ev.target;
            if(!handle.classList.contains('card')) return ;
            if(!handle.classList.contains('back')) return ;

            if([...handle.parentNode.children].pop() != handle) return;

            models.handleCardEachFace(handle);
        }

        this.handleCardPick = function (ev) {
            const handle = ev.target;
            if (!handle.classList.contains('card')) return;
            if (!handle.classList.contains('front')) return;
            // if(!handle.parentNode.classList.contains('col-stacking')) return;
            if (handle.parentNode.classList.contains('stacking')) {
                if ([...document.querySelector('.stacking').children].pop() != handle) {
                    return;
                }
            }

            if(!handle.parentNode.classList.contains('stacks'))
            models.handleCardPick(handle);
            // models.handleCardMove(handle);
        }

        this.handleGetCardInStores = function (ev) {
            const handle = ev.target;
            if (!handle.classList.contains('card')) return;
            if (!handle.parentNode.classList.contains('stores')) return;
            // handle
            models.handleGetCardInStores();
        }
    }

    function Model() {
        const cardStore = [];
        const cardDeck = [];
        const cardStack = [];
        const cardTempStore = [];
        const cardTempPick = [];

        let parts = null;

        let views = null;

        this.init = function (view) {
            views = view;
            parts = view.part();

            this.setAllCard();
            this.shuffleCard();
            this.setPlayCard();

            // console.log(cardStore)
            // console.log(cardDeck)
            // console.log(cardStack)
            // 77 사이즈 세팅 - ✅
            // 남은 카드 store에 넣기 - ✅
            // stack 비우기 - ✅
        }

        // card set //
        this.shuffleCard = function () {
            for (let card in cardStore) {
                const random = parseInt(Math.random() * cardStore.length);
                [cardStore[card], cardStore[random]] = [cardStore[random], cardStore[card]];
            }
        }

        this.setAllCard = function () {
            const cards = parts.Card;
            let count = 1;
            for (let type of [...cards.types]) {
                for (let num of [...cards.nums]) {
                    cardStore.push({
                        id: count++,
                        type: type,
                        num: num,
                        isPick: false,
                        isBack: true,
                        isStored: true,
                    });
                }
            }
        }

        this.setPlayCard = function () {
            const cards = parts.Card.deckCount;
            for (let col = 1; col <= cards; col++) {
                const newCol = [];
                for (let row = 1; row <= col; row++) {
                    const input = cardStore.pop();
                    input.isStored = false;
                    newCol.push(input);
                }
                const lastCard = newCol[newCol.length-1];
                lastCard.isBack = false;
                cardDeck.push(newCol);
            }
            parts.Card.types.forEach(type => cardStack.push([]));
        }

        // event controller parts
        this.handleGetCardInStores = function () {
            // store에서 카드 한 장 씨 뽑기
            // stack에 쌓기
            // console.log(cardDeck)
            // console.log(cardStack)
            if (cardStore.length == 0) {
                views.stopStoreDeck();
                return;
            }
            const oneCardLastStored = cardStore.pop();
            oneCardLastStored.isStored = false;
            oneCardLastStored.isBack = false;
            cardTempStore.push(oneCardLastStored);

            views.handleGetCardInStores(cardTempStore);
        }

        this.handleCardMove = function (handle) {
            let prevCard;
            const data = handle.dataset;
            let pickCard = this.findDeckById(data, cardDeck) ?? this.findStoreById(data, cardTempStore) ?? this.findStackById(data, cardStack);

            // 첫 선택 시 템프에 없으면 넣고 있으면 뺀다
            if(cardTempPick.length>0) prevCard = cardTempPick.pop();
            else cardTempPick.push(pickCard);

            // console.log(handle)
            // console.log(prevCard, pickCard)

            if(prevCard){
                if(!pickCard){
                    if(handle.parentNode.className=='col-stacking'){
                        let popCard;
                        if(prevCard.cardNum){
                            popCard = prevCard.parent[prevCard.deckNum].splice(prevCard.cardNum, 1).pop();
                        } else {
                            popCard = prevCard.parent.splice(prevCard.deckNum, 1).pop();
                        }
                        cardDeck[[...handle.parentNode.children].indexOf(handle)].push(popCard);
                    }
                }
                if(prevCard.card.num == pickCard.card.num-1){
                    if(this.isCrossSide(prevCard.card.type, pickCard.card.type)){
                        this.moveCard(prevCard, pickCard);
                    } else {
                        // console.log('색상 교차 아님');
                    }
                } else {
                    // console.log('수가 등차가 아님');
                }
            } else {
                // console.log('준비')
            }
            console.log(cardTempStore)
            views.handleCardPick(cardDeck, cardStack, cardTempStore);
        }

        this.moveCard = function(prev, pick){
            let popCard;
            if(prev.cardNum){
                popCard = prev.parent[prev.deckNum].splice(prev.cardNum, 1).pop();
            } else {
                popCard = prev.parent.splice(prev.deckNum, 1).pop();
            }
            if(pick.cardNum){
                pick.parent[pick.deckNum].push(popCard);
            } else {
                pick.parent.push(popCard);
            }

            console.log(prev.parent, pick.parent)
        }

        this.isCrossSide = function(prev, pick){
            const left = (type) => parts.Card.types.slice(0, 2).indexOf(type)>-1;
            const right = (type) => parts.Card.types.slice(2).indexOf(type)>-1;

            if(left(prev) && right(pick)){
                return true;
            } else if(left(pick) && right(prev)){
                return true;
            }

            return false;
        }

        this.handleCardPick = function (handle) {
            // 선택 시 카드 활성화
            // 선택 카드 외 카드 들어갈 자리 표시
            // 스택에 올리고 내리고를 할 수 있어야 한다.
            const data = handle.dataset;
            let pickCard = this.findDeckById(data, cardDeck) ?? this.findStoreById(data, cardTempStore) ?? this.findStackById(data, cardStack);

            if(!data.cardId) return;
            if(!pickCard) return;
            
            if(this.isStackable(pickCard)){
                views.handleCardPick(cardDeck, cardStack, cardTempStore);
                return;
            } // 첫 선택에 스택되면 이후 실행 차단

            this.handleCardMove(handle)
            // console.log('===============')
            // console.log(cardStack)
            // console.log(cardDeck)
            // console.log(cardTempStore)
            // console.log('===============')
            // console.log(pickCard)
            // cardTempPick.push()

            // 1. 스택에 올릴 수 있는 카드인지 판별
            //  1. 스택에 있는 카드를 다시 내릴 수 있도록 한다.
            // 2. 스택에 올라가지 못할 때
            //  1. 선택 비교 실행
            // cardTempPick.push(pickCard);

            // console.log(pickCard);
            // this.initAttrPicked();
            // console.log(prePick, pick)
            // console.log(cardDeck, cardStack)

            views.handleCardPick(cardDeck, cardStack, cardTempStore);
        }

        this.isStackable = function ({card, type, num, deckNum, cardNum, parent}) {
            const idx = parts.Card.types.indexOf(type);
            if(parent[0].length>0){
                if(![...cardStack[idx]].pop()){
                    if(card.num==1){
                        if(parent[deckNum].length==1)
                        cardStack[idx].push(parent[deckNum].splice(cardNum, 1, []).pop());
                        else
                        cardStack[idx].push(parent[deckNum].splice(cardNum, 1).pop());
                        return true;
                    }
                } else {
                    if([...cardStack[idx]].pop().num == card.num-1){
                        if(parent[deckNum].length==1)
                        cardStack[idx].push(parent[deckNum].splice(cardNum, 1, []).pop());
                        else
                        cardStack[idx].push(parent[deckNum].splice(cardNum, 1).pop());
                        return true;
                    }
                }
            } else {
                if(![...cardStack[idx]].pop()){
                    if(card.num==1){
                        if(parent.length==1)
                        cardStack[idx].push(parent.splice(deckNum, 1, []).pop());
                        else
                        cardStack[idx].push(parent.splice(deckNum, 1).pop());
                        return true;
                    }
                } else {
                    if([...cardStack[idx]].pop().num == card.num-1){
                        if(parent.length==1)
                        cardStack[idx].push(parent.splice(deckNum, 1, []).pop());
                        else
                        cardStack[idx].push(parent.splice(deckNum, 1).pop());
                        return true;
                    }
                }
            }
            return false;
        }

        this.findDeckById = function ({
            cardId: pickId,
            cardType: pickType,
            cardNum: pickNum
        }) {
            for (let deck in cardDeck) {
                for (let card in cardDeck[deck]) {
                    const [type, num] = [cardDeck[deck][card].type, cardDeck[deck][card].num];
                    if (type == pickType && num == pickNum) {
                        return {
                            card: cardDeck[deck][card],
                            type: type,
                            num: num,
                            deckNum: parseInt(deck),
                            cardNum: parseInt(card),
                            parent: cardDeck
                        };
                    }
                }
            }
            return undefined;
        }
        this.findStoreById = function ({
            cardId: pickId,
            cardType: pickType,
            cardNum: pickNum
        }) {
            for (let deck in cardTempStore) {
                const [type, num] = [cardTempStore[deck].type, cardTempStore[deck].num];
                if (type == pickType && num == pickNum) {
                    return {
                        card: cardTempStore[deck],
                        type: type,
                        num: num,
                        deckNum: parseInt(deck),
                        parent: cardTempStore
                    };
                }
            }
            return undefined;
        }
        this.findStackById = function ({
            cardId: pickId,
            cardType: pickType,
            cardNum: pickNum
        }) {
            for (let deck in cardStack) {
                for (let card in cardStack[deck]) {
                    const [type, num] = [cardStack[deck][card].type, cardStack[deck][card].num];
                    if (type == pickType && num == pickNum) {
                        return {
                            card: cardStack[deck][card],
                            type: type,
                            num: num,
                            deckNum: parseInt(deck),
                            cardNum: parseInt(card),
                            parent: cardStack
                        };
                    }
                }
            }
            return undefined;
        }
        
        this.validEachSide = function (prev, now) {
            // 검정 혹은 빨강인지 판별
            const isLeft = (type) => parts.Card.types.slice(0, 2).indexOf(type) > -1 ? true : false;
            const isRight = (type) => parts.Card.types.slice(2).indexOf(type) > -1 ? true : false;

            if ((isLeft(prev.type) && isRight(now.type)) || (isRight(prev.type) && isLeft(now.type))) return true;
            else false;
        }

        this.initAttrPicked = function () {
            cardDeck.map(deck => deck.map(card => {
                card.isPick = false;
                return card;
            }))
        }

        this.handleCardEachFace = function (handle) {
            // 카드 뽑기, 빈 곳 카드 뒤집기
            const data = handle.dataset;
            let pickCard = this.findDeckById(data, cardDeck) ?? this.findStoreById(data, cardTempStore) ?? this.findStackById(data, cardStack);

            pickCard.card.isBack = false;

            views.handleCardPick(cardDeck, cardStack, cardTempStore);
        }

        // render //
        this.renderCardDekcs = function () {
            views.renderCardDekcs(cardStore, cardDeck, cardStack);
        }
    }

    function View() {
        let elemStores = null;
        let elemStacks = null;
        let elemDecks = null;
        let parts = null;

        this.init = function (part) {
            parts = part;
            document.body.prepend(parts.app);
            this.createGame();
        }

        this.createGame = function () {
            this.setGround();
            [elemStores, elemStacks, elemDecks] = [...document.querySelectorAll('.row>*, .col>*')];
        }

        this.setGround = function () {
            parts.app.insertAdjacentHTML('beforeend', parts.SGround.render());
        }

        this.renderCardDekcs = function (store, deck, stack) {
            this.setStores(store);
            this.setDecks(deck);
            this.setStacks(stack);
        }

        this.setStores = function (store) {
            elemStores.insertAdjacentHTML('beforeend', parts.SCard.render({
                isBack: true
            }));
            elemStores.insertAdjacentHTML('beforeend', parts.SStacking.render());
        }

        this.setDecks = function (decks) {
            const copyDecks = [...decks];
            for (let deck in copyDecks) {
                const colStack = document.createElement('div');
                colStack.classList.add('col-stacking');
                for (let card in copyDecks[deck]) {
                    colStack.insertAdjacentHTML('beforeend', parts.SCard.render(copyDecks[deck][card], card));
                }
                elemDecks.append(colStack);
            }
        }

        this.setStacks = function (stack) {
            for (let type in stack) {
                // for (let card in stack[type]) {
                if (stack[type].length == 0)
                    elemStacks.insertAdjacentHTML('beforeend', parts.SCard.render());
                else {
                    const lastCard = [...stack[type]].pop();
                    elemStacks.insertAdjacentHTML('beforeend', parts.SCard.render(lastCard));
                }
                // }
            }
        }

        // event controller parts
        this.handleGetCardInStores = function (store) {
            this.renderStacking(store);
        }

        this.handleCardPick = function (cardDeck, cardStack, cardTempStore) {
            if(cardDeck.length>0) this.renderColStacking(cardDeck);
            if(cardStack.length>0) this.renderStacks(cardStack);
            if(cardTempStore.length>0) this.renderStores(cardTempStore);
        }

        // view parts
        this.renderStacking = function (store) {
            const stacking = elemStores.querySelector('.stacking');
            this.clearView(stacking);
            store.forEach((card, idx) => {
                stacking.insertAdjacentHTML('beforeend', parts.SCard.render(card, -idx * (1.1 / store.length) * 100));
                // stack이 쌓이면 쌓이는 개수만큼 최대를 초과하지 않고,
                // 등분되어 쌓이게 한다.
            });
        }

        this.renderColStacking = function (cardDecks) {
            this.clearView(elemDecks);
            this.setDecks(cardDecks);
        }

        this.renderStacks = function (cardStacks) {
            this.clearView(elemStacks);
            this.setStacks(cardStacks);
        }

        this.renderStores = function (cardStores) {
            this.clearView(elemStores);
            this.setStores(cardStores)
            this.renderStacking(cardStores);
        }

        this.clearView = function (target) {
            target.innerHTML = '';
        }

        this.stopStoreDeck = function () {
            [...elemStores.children].shift().classList.add('stop');
        }

        // emit to parent
        this.part = function () {
            return parts;
        }
    }

    return {
        init() {
            const app = document.createElement('div');
            app.id = 'app';

            const Card = {};
            Card.deckCount = 7;
            Card.width = 50;
            Card.height = Card.width * 1.5;
            Card.types = ['spades', 'clubs', 'hearts', 'diamonds'];
            Card.shapes = ['♠', '♣', '♥', '♦'];
            Card.nums = new Array(13).fill(0).map((c, i) => i + 1);

            const components = {
                app,
                Card,
                SCard,
                SStacking,
                SGround,
            }

            const view = new View();
            const model = new Model();
            const controller = new Controller();

            view.init(components);
            model.init(view);
            controller.init(model);
        }
    }
})().init();