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
            window.addEventListener('click', this.handleGetCardInStores);
            window.addEventListener('click', this.handleCardPick);
            window.addEventListener('click', this.handleCardEachFace);
            window.addEventListener('click', this.restart);
        }

        this.restart = function(ev){
            const btn = ev.target;
            if(!btn.classList.contains('restart')) return;

            models.restart(btn);
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

        this.handleCardPick = function(ev){
            const handle = ev.target;
            if(!handle.classList.contains('card')) return;

            if(handle.classList.contains('empty')){
                models.handleCardPick([handle]);
            }

            if(!handle.classList.contains('front')) return;

            if(handle.parentNode.classList.contains('stacking')){
                if([...handle.parentNode.children].pop() != handle) return;
                models.handleCardPick([handle]);
            } else if(handle.parentNode.classList.contains('stacks')){
                models.handleCardPick([handle]);
            } else {
                const copyList = [...handle.parentNode.children];
                const handles = copyList.slice(copyList.indexOf(handle));
                models.handleCardPick(handles);
            }
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
        let movedCount = 0;
        let cardTempPick = null;
        let cardTempBundler = null;
        let pickMode = false;

        let parts = null;

        let views = null;

        this.init = function (view) {
            views = view;
            parts = view.part();
            // this.initCard();
            this.setAllCard();
            this.shuffleCard();
            this.setPlayCard();
        }

        this.restart = function(){
            movedCount = 0;
            this.initCard();
            this.setAllCard();
            this.shuffleCard();
            this.setPlayCard();
            this.renderCardDekcs();
            views.renderMoveCount(0);
            this.renderScore(cardStack);
        }

        this.initCard = function(){
            cardTempPick = null;
            cardTempBundler = null;

            while(cardTempStore.length>0){
                cardTempStore.pop();
            }
            while(cardDeck.length>0){
                cardDeck.pop();
            }
            while(cardStore.length>0){
                cardStore.pop();
            }
            while(cardStack.length>0){
                cardStack.pop();
            }
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
                        isBack: true, // 개발용 세팅
                        isStored: true,
                    });
                }
            }

            for(let i=0; i<parts.Card.deckCount; i++){
                cardDeck.push([]);
            }

            parts.Card.types.forEach(type => cardStack.push([]));
        }

        this.setPlayCard = function () {
            const cards = parts.Card.deckCount;
            for(let i=0; i<parts.Card.deckCount; i++){
                cardDeck.pop();
            }

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
        }
        // card set //

        /**
         * handle part
         */
        this.handleCardPick = function(handles){
            /**
             * 1. 스택가능한가?
             * 2. 스택이 안된다면 첫번째 픽.
             * 3. 두번째 픽과 등차관계인가?
             * 4. 관계히면 해당위치로 이동.
             * 5. 관계하지 않으면 취소.
             * 6. 선택한 카드 이후의 카드를 모두 옮겨야한다.
             * 7. 묶음이 차례가 아니면 취소.
             */

            const bundler = this.PickCardsToData(handles);
            const pickCard = [...bundler].shift();

            // console.log(bundler)
            if(!pickMode && pickCard==undefined) return;
            if(pickMode && pickCard==undefined){
                this.renderMoveCount();
                this.moveCard2Empty(cardTempBundler, cardTempPick, handles);
                pickMode = false;
                cardTempPick = null;
                cardTempBundler = null;
                this.initAttrPicked();
                views.handleCardPick(cardDeck, cardStack, cardTempStore);
                return;
            }

            if(!this.isCascade(bundler)) {
                // dev done** console.log('순차 묶음이 아닙니다.');
                pickMode = false;
                cardTempPick = null;
                cardTempBundler = null;
                this.initAttrPicked();
                views.handleCardPick(cardDeck, cardStack, cardTempStore);
                return;
            }
            // dev done** console.log('순차묶음 또는 개별카드입니다.')

            if(this.isStackable(pickCard) && !pickMode){
                if(bundler.length==1) {
                    this.renderMoveCount();
                    this.directStackMove(pickCard);
                } else {
                    pickMode = true;
                    bundler.map(({card})=>card.isPick=true);
                    cardTempBundler = bundler;
                    // pickCard.card.isPick = true;
                    cardTempPick = pickCard;
                }
            } else {
                if(pickMode){
                    // dev done** console.log('두번째 픽')
                    if(!handles[0].parentNode.classList.contains('col-stacking')) {
                        pickMode = false;
                        cardTempPick = null;
                        cardTempBundler = null;
                        this.initAttrPicked();
                        views.handleCardPick(cardDeck, cardStack, cardTempStore);
                        return;
                    }
                    console.log(cardTempPick)
                    if(pickCard.card == cardTempPick.card){
                        // 같은 카드 클릭 시
                    } else if(pickCard.card.isPick==true) {
                        this.initAttrPicked();
                    } else if(cardTempPick.num == pickCard.num-1){
                        if(this.isCrossSide(cardTempPick.type, pickCard.type)){
                            // dev done** console.log('쌓기 가능')
                            // 이동 메서드
                            this.renderMoveCount();
                            this.moveCard2Card(cardTempBundler, cardTempPick, pickCard, bundler);
                        } else {
                            // dev done** console.log('쌓기 불가')
                        }
                    } else {
                        // dev done** console.log('쌓기 불가')
                    }
                    pickMode = false;
                    cardTempPick = null;
                    cardTempBundler = null;
                    this.initAttrPicked();
                } else {
                    // dev done** console.log('첫번째 픽')
                    pickMode = true;
                    bundler.map(({card})=>card.isPick=true);
                    cardTempBundler = bundler;
                    // pickCard.card.isPick = true;
                    cardTempPick = pickCard;
                    // console.log(cardTempPick);
                }
            }
            
            if(cardStack.filter(last=>last.length>0 && last[last.length-1].num == 13).length==4){
                views.successGame();
            }

            this.renderScore(cardStack);
            views.handleCardPick(cardDeck, cardStack, cardTempStore);
        }

        this.renderScore = function(score){
            let count = 0;
            score.forEach(x=>count+=x.length);
            views.renderScore(count);
        }

        this.renderMoveCount = function(){
            movedCount++;
            console.log(movedCount)
            views.renderMoveCount(movedCount);
        }

        this.moveCard2Empty = function(bundler, prev, handles){
            if(prev.num!=13) return; // 개발용 easy버전
            let moveCard = [];
            // dev done** console.log(bundler)
            if(prev.parent[0] instanceof Array){
                for(let i=0; i<bundler.length; i++){
                    moveCard.push(prev.parent[prev.deckNum].pop());
                }
            } else {
                for(let i=0; i<bundler.length; i++){
                    moveCard.push(prev.parent.pop());
                }
            }

            for(let deck in cardDeck){
                if(cardDeck[deck].length==0 && deck == [...handles[0].parentNode.parentNode.children].indexOf(handles[0].parentNode)){
                    cardDeck[deck].push(...moveCard.reverse());
                    return;
                }
            }
        }

        this.moveCard2Card = function(bundler, prev, pick, bundlers){
            let moveCard = [];
            if(bundlers.length>1) return;
            if(prev.parent[0] instanceof Array){
                for(let i=0; i<bundler.length; i++){
                    moveCard.push(prev.parent[prev.deckNum].pop());
                }
            } else {
                for(let i=0; i<bundler.length; i++){
                    moveCard.push(prev.parent.pop());
                }
            }
            pick.parent[pick.deckNum].push(...moveCard.reverse());
        }

        this.directStackMove = function(card){
            let moveCard;
            if(card.parent[0] instanceof Array){
                moveCard = card.parent[card.deckNum].splice(card.cardNum).pop();
            } else {
                moveCard = card.parent.splice(card.deckNum).pop();
            }
            cardStack[parts.Card.types.indexOf(moveCard.type)].push(moveCard);
        }

        this.PickCardsToData = function(handles){
            if(handles[0].classList.contains('empty')) {
                return [];
            }
            return [...handles].map(handle=>{
                const data = handle.dataset;
                return this.getCardInfo(data);
            });
        }

        this.isCascade = function(bundler){
            const copyBundler = [...bundler];
            // dev done** console.log(copyBundler.length-1)
            for(let valid=0; valid<copyBundler.length-1; valid++){
                if(copyBundler[valid].num == copyBundler[valid+1].num+1){
                    // dev done** console.log('숫자는 차례입니다.')
                    if(this.isCrossSide(copyBundler[valid].type, copyBundler[valid+1].type)){
                        continue;
                    } else {
                        // dev done** console.log('크로스가 되지 않습니다')
                        return false;
                    }
                } else {
                    return false;
                }
            }
            return true;
        }

        this.handleCardEachFace = function (handle) {
            // 카드 뽑기, 빈 곳 카드 뒤집기
            const data = handle.dataset;
            let pickCard = this.getCardInfo(data);

            pickCard.card.isBack = false;

            views.handleCardPick(cardDeck, cardStack, cardTempStore);
        }

        this.handleGetCardInStores = function () {
            // store에서 카드 한 장 씩 뽑기
            // stack에 쌓기
            // console.log(cardDeck)
            // console.log(cardStack)
            if (cardStore.length == 0) {
                views.stopStoreDeck();
                return;
            }
            // let oneCardLastStored = cardStore.pop();

            let oneCardLastStored;
            for(let deck of cardDeck){
                for(let store in cardStore){
                    if(deck.length==0) continue;
                    if(deck[deck.length-1].num-1==cardStore[store].num&&!this.isCrossSide(deck.type, cardStore[store].type)){
                        console.log(cardStore[store])
                        oneCardLastStored = cardStore.splice(store, 1).pop();
                        break;
                    }
                }
                if(oneCardLastStored) break;
            }
            if(!oneCardLastStored) oneCardLastStored = cardStore.pop();
            oneCardLastStored.isStored = false;
            oneCardLastStored.isBack = false;
            cardTempStore.push(oneCardLastStored);

            views.handleGetCardInStores(cardTempStore);
        }

        /**
         * valid part
         */
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

        this.isStackable = function ({card, type, num, deckNum, cardNum, parent}) {
            const idx = parts.Card.types.indexOf(type);
            if(parent[0].length>0){
                if(![...cardStack[idx]].pop()){
                    if(card.num==1){
                        return true;
                    }
                } else {
                    if([...cardStack[idx]].pop().num == card.num-1){
                        return true;
                    }
                }
            } else {
                if(![...cardStack[idx]].pop()){
                    if(card.num==1){
                        return true;
                    }
                } else {
                    if([...cardStack[idx]].pop().num == card.num-1){
                        return true;
                    }
                }
            }
            return false;
        }

        this.getCardInfo = function(data){
            return this.findDeckById(data, cardDeck) ?? this.findStoreById(data, cardTempStore) ?? this.findStackById(data, cardStack);
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

        this.initAttrPicked = function () {
            [].concat(...cardTempStore,...cardStore).map(card => {
                card.isPick = false;
                return card;
            });

            [...cardDeck,...cardStack].map(deck => deck.map(card => {
                card.isPick = false;
                return card;
            }));
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
        let secTemp = 0;
        let totalTime = 0;

        this.init = function (part) {
            parts = part;
            document.body.prepend(parts.app);
            document.body.insertAdjacentHTML('afterbegin', `
            <div class="title">
                <div>
                    <span>time</span>
                    <span class="time"></span>
                </div>
                <div>
                    <span>score</span>
                    <span class="score">0</span>
                    ⩵ 
                    <span>moved</span>
                    <span class="moved">0</span>
                </div>
                <div style="margin-top: 1em;">
                    <button class="restart">restart</button>
                </div>
            </div>
            `);
            this.setTime();
            this.createGame();
        }

        this.renderScore = function(score){
            document.querySelector('.score').textContent = score;
        }

        this.renderMoveCount = function(moved){
            document.querySelector('.moved').textContent = moved;
        }

        this.successGame = function(){
            document.body.insertAdjacentHTML('afterbegin', `
                <div id="success">
                    <div>축하합니다!</div>
                    <div>게임을 완료했습니다!</div>
                    <div>🎉🃏🃏🃏✨</div>
                    <div>
                        <button class="restart">
                            restart
                        </button>
                    </div>
                </div>
            `);
        }

        this.setTime = function(){
            totalTime = 0;
            requestAnimationFrame(this.ticktock.bind(this));
        }

        this.ticktock = function(){
            const second = new Date().getSeconds();
            if(secTemp<second){
                const min = parseInt(totalTime/60);
                const sec = totalTime%60;
                const time = document.querySelector('.time');
                time.textContent = `${min.toString().padStart(2, 0)}:${sec.toString().padStart(2, 0)}`;
                totalTime++;
            }
            secTemp = second;
            requestAnimationFrame(this.ticktock.bind(this));
        }

        this.createGame = function () {
            this.setGround();
            [elemStores, elemStacks, elemDecks] = [...document.querySelectorAll('.row>*, .col>*')];
        }

        this.setGround = function () {
            parts.app.insertAdjacentHTML('beforeend', parts.SGround.render());
        }

        this.renderCardDekcs = function (store, deck, stack) {
            cancelAnimationFrame(this.ticktock.bind(this));
            const success = document.querySelector('#success');
            if(success) success.remove();
            
            this.setTime();

            this.clearView(elemDecks);
            this.clearView(elemStacks);
            this.clearView(elemStores);

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
            // dev done** console.log(copyDecks)
            for (let deck in copyDecks) {
                const colStack = document.createElement('div');
                colStack.classList.add('col-stacking');
                if(copyDecks[deck].length==0){
                    colStack.insertAdjacentHTML('beforeend', parts.SCard.render({class:'empty'}));
                }
                for (let card in copyDecks[deck]) {
                    colStack.insertAdjacentHTML('beforeend', parts.SCard.render(copyDecks[deck][card], card));
                }
                elemDecks.append(colStack);
            }
        }

        this.setStacks = function (stack) {
            for (let type in stack) {
                if (stack[type].length == 0)
                    elemStacks.insertAdjacentHTML('beforeend', parts.SCard.render());
                else {
                    const lastCard = [...stack[type]].pop();
                    elemStacks.insertAdjacentHTML('beforeend', parts.SCard.render(lastCard));
                }
            }
        }

        // event controller parts
        this.handleGetCardInStores = function (store) {
            this.renderStacking(store);
        }

        this.handleCardPick = function (cardDeck, cardStack, cardTempStore) {
            if(cardDeck.length>=0) this.renderColStacking(cardDeck);
            if(cardStack.length>=0) this.renderStacks(cardStack);
            if(cardTempStore.length>=0) this.renderStores(cardTempStore);
        }

        // view parts
        this.renderStacking = function (store) {
            const stacking = elemStores.querySelector('.stacking');
            this.clearView(stacking);
            // dev done** console.log(store)
            [...store].slice(store.length<3?0:store.length-3, store.length).forEach((card, idx) => {
                stacking.insertAdjacentHTML('beforeend', parts.SCard.render(card, -idx * 50));
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
            if(cardStores.length>0) this.renderStacking(cardStores);
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