/**
 * 수정해야 할 사항
 * 1. 마지막 패 외에는 뒤집어져 있어야 함
 * 2. 카드를 뽑을 때 한장 씩 쌓이면서 뽑혀야함
 * 3. 뒤집어진 카드 외에는 차례로 있을 시 묶음으로 잡혀야 함
 */

(function(){
    function Controller(){
        let models = null;
        
        this.init = function(model){
            models = model;

            models.renderDecks();
            window.addEventListener('click', this.handleLastCard);
            window.addEventListener('click', this.addRestCardToEachDeck);
        }

        this.handleLastCard = function(ev){
            const target = ev.target;
            const children = target.parentNode?.children;
            if(!target.classList.contains('card')) return;

            if([...children][children.length-1] == target){
                const [type, name] = [...target.children];
                models.stackLastCard(type.dataset.type, parseInt(name.dataset.name), target);
            }
        }

        this.addRestCardToEachDeck = function(ev){
            const target = ev.target;

            if(target.className != 'recharge') return;

            models.addRestCardToEachDeck(target);
        }
    }

    function Model(){
        const deckLimit = 7;
        const types = ['spades', 'clubs','hearts','diamonds'];
        const cards = [1,2,3,4,5,6,7,8,9,10,11,12,13];

        let storageDeck = [];
        let stackCards = [];
        let viewCards = [];

        let views = null;
        let decks = [];

        let activeCard = null;

        this.init = function(view){
            views = view;

            this.createDeck();
        }

        this.createDeck = function(){
            // console.log(this.randomCard(types, cards));
            decks = this.allRandomCard(types, cards);
        }

        this.renderDecks = function(){
            for(let i=1; i<=7; i++){
                viewCards[i-1]=[];
                for(let q=1; q<i+1; q++){
                    viewCards[i-1].push(decks.shift());
                }
            }

            views.renderDecks([...viewCards]);
        }

        this.addRestCardToEachDeck = function(target){
            for(let deck of viewCards){
                if(decks.length>0) deck.push(decks.pop());
            }
            if(decks.length==0){
                document.querySelector('.recharge').classList.add('no-card');
            }
            views.renderDecks(viewCards);
        }

        this.stackLastCard = function(type, name, target){
            const idx = types.indexOf(type);

            
            if(!stackCards[idx]) stackCards[idx] = [];
            let len = stackCards[idx].length;
            
            this.validPick(target, type, name);
            
            if(len==0){
                if(name == 1){
                    stackCards[idx].push([type, name]);
                    viewCards = [...viewCards].map(deck=>deck.filter(([t,n])=>type!=t||name!=n));
                    views.renderDecks(viewCards);
                } else {
                    console.warn('[Error] 첫 스택 카드는 에이스부터 입니다.')
                }
            } else {
                if(stackCards[idx][len-1][1] == name-1) {
                    stackCards[idx].push([type, name]);
                    viewCards = [...viewCards].map(deck=>deck.filter(([t,n])=>type!=t||name!=n));
                    views.renderDecks(viewCards);
                } else {
                    console.warn(`[Error] 선택 카드 "${name}"은 "${stackCards[idx][len-1][1]}" 다음 수가 아닙니다.`);
                }
            }

            this.renderStackDeck(stackCards);
        }

        this.clearPickClass = function(){
            document.querySelectorAll('.empty').forEach(x=>x.remove());
            document.querySelectorAll('.active').forEach(x=>x.classList.remove('active'));
            views.renderDecks(viewCards);
        }

        this.validPick = function(target, type, name){
            // console.log(name)
            if(target.classList.contains('empty')){
                const isLeft = (type)=>types.slice(0, 2).indexOf(type)>-1?true:false;
                const isRight = (type)=>types.slice(2).indexOf(type)>-1?true:false;

                if(activeCard[1]==name-1 && type!=activeCard[0]){
                    console.log(isLeft(activeCard[0]))
                    console.log(isRight(activeCard[0]))
                    console.log(isLeft(type))
                    console.log(isRight(type))
                    if((isLeft(activeCard[0]) && isRight(type)) || (isRight(activeCard[0]) && isLeft(type))){
                        console.log('카드 무빙')
                        // console.log(activeCard)
                        for(let deck of viewCards){
                            for(let card of deck){
                                if(card[0] == activeCard[0] && card[1] == activeCard[1]){
                                    deck.pop();
                                    break;
                                }
                            }
                        }

                        for(let deck of viewCards){
                            for(let card of deck){
                                if(card[0] == type && card[1] == name){
                                    deck.push(activeCard);
                                    break;
                                }
                            }
                        }

                        // console.log(viewCards.map(item=>item.filter(fil=>activeCard==fil)).filter(x=>x))
    
                        // target.parentNode.append(activeCard)
                        activeCard = [];
                        this.clearPickClass();
                    }
                } else {
                    console.log('카드 부동')
                    this.clearPickClass();
                }
            } else {
                if(target.classList.contains('active')){
                    this.clearPickClass();
                    return ;
                }
                target.classList.add('active');
                activeCard = [type, name];
                document.querySelectorAll('.col').forEach(col=>{
                    if(col.children.length>0)
                    if(target.parentNode!=col) {
                        let top = parseInt(col.querySelector('.card:last-child')?.style.top.replace(/[^0-9\.]/gm, ''));
                        let [childType, childName] = [...col.querySelector('.card:last-child')?.children];
                        col.insertAdjacentHTML('beforeend', `<div class="card empty" style="border-radius: .5rem; top: ${top+30}px; background-color: rgba(255,255,255,0.5)">
                            <div data-type="${childType.dataset.type}" hidden></div>
                            <div data-name="${childName.dataset.name}" hidden></div>
                        </div>`);
                    }
                });
            }

        }

        this.renderStackDeck = function(stackCards){
            views.renderStackDeck(stackCards);
        }

        this.allRandomCard = function(types, cards){
            const allRandomDeck = [];
            types.map(type=>this.createTypeCard(type, cards)).forEach(deck=>allRandomDeck.push(...deck));
            return this.shuffleCard(allRandomDeck);
        }

        this.randomCard = function(types, cards){
            return types.map(type=>this.createTypeCard(type, cards)).map(typeCard=>this.shuffleCard(typeCard));
        }

        this.createTypeCard = function(type, card){
            return card.map(c=>[type, c]);
        }

        this.shuffleCard = function(array){
            for(let card in array){
                const random = parseInt(Math.random()*array.length);
                [array[card], array[random]] = [array[random], array[card]];
            }
            return [...array];
        }
    }

    function View(){
        const deckLimit = 7;
        const cardInfo = {};
        let parts = null;

        this.init = function(component){
            parts = component;

            this.settingCardInfo();
            this.createGround(parts);
        }

        this.settingCardInfo = function(){
            cardInfo['width'] = 74;
            cardInfo['height'] = cardInfo['width']*1.445;
            cardInfo['box-shadow'] = '0 0 .3rem 0 rgba(0,0,0,0.5)';
            // cardInfo['border'] = '2px solid rgb(70,70,70)';
            cardInfo['border-radius'] = '.3rem';
            cardInfo['background-color'] = 'white';
        }

        this.createGround = function({app, ground}){
            app.insertAdjacentHTML('beforeend', ground.render(this.createStacks()));
        }

        this.convertStyleSheet = function(cardInfo){
            return Object.keys(cardInfo).map(info=>
                `${info}: ${!isNaN(cardInfo[info])
                    ?cardInfo[info]+'px'
                    :cardInfo[info]}`
                ).join('; ');
        }

        this.createStacks = function(){
            const style = this.convertStyleSheet(cardInfo);
            return {
                stacks: parts.stacks.render(style),
                plays: parts.plays.render(),
                gotcha: parts.gotcha.render(style),
            }
        }

        this.renderDecks = function(cardDeck){
            const decks = document.querySelector('.decks');
            const style = this.convertStyleSheet(cardInfo);
            const rowGap = 35;
            let copyDeck = [].slice.call(cardDeck);
            decks.innerHTML = '';

            for(let i=0; i<cardDeck.length; i++){
                const col = document.createElement('div');
                col.className = 'col';
                col.style.cssText = this.convertStyleSheet({width: cardInfo['width'], height: cardInfo['width']*1.5})
                for(let q=0; q<=cardDeck[i].length-1; q++){
                    col.insertAdjacentHTML('beforeend', parts.card.render(copyDeck[i][q], style+`; top: ${(q)*rowGap}px`));
                }
                decks.append(col);
            }
        }

        this.renderStackDeck = function(stackDeck){
            const [spades, clubs, hearts, diamonds] = [...document.querySelectorAll('.slot')];
            const style = this.convertStyleSheet(cardInfo);

            const ops = {
                spades,
                clubs,
                hearts,
                diamonds,
            }

            Object.keys(ops).forEach(tag=>{
                ops[tag].innerHTML = '';
            });
            
            for(let i=0; i<stackDeck.length; i++){
                if(stackDeck[i]){
                    for(let q=0; q<stackDeck[i].length; q++){
                        ops[stackDeck[i][q][0]].insertAdjacentHTML('beforeend', parts.card.render(stackDeck[i][q], style))
                    }
                }
            }
        }
    }

    return {
        init(){
            const component = {
                app: document.querySelector('#app'),
                ground: {
                    render({stacks='', plays='', gotcha=''}){
                        return `
                            <div class="ground">
                                <div class="column">${stacks}</div>
                                <div class="column">${plays}</div>
                                <div class="column">${gotcha}</div>
                            </div>
                        `
                    }
                },
                stacks: {
                    render(style){
                        return `
                            <div class="stacks">
                                <div class="slot" style="${style}"></div>
                                <div class="slot" style="${style}"></div>
                                <div class="slot" style="${style}"></div>
                                <div class="slot" style="${style}"></div>
                            </div>
                        `
                    }
                },
                plays: {
                    render(){
                        return `
                            <div class="plays">
                                <div class="decks"></div>
                            </div>
                        `
                    }
                },
                gotcha: {
                    render(style){
                        return `
                            <div class="gotcha">
                                <div class="store">
                                    <div class="recharge" style="${style}"></div>
                                </div>
                            </div>
                        `
                    }
                },
                card: {
                    render([type, name], style){
                        let originName = name;
                        let originType = type;
                        let imgName = '';
                        let imgType = '';
                        switch(type){
                            case 'spades':
                                imgType = type;
                                type = '♠';
                                break;
                            case 'clubs':
                                imgType = type;
                                type = '♣';
                                break;
                            case 'hearts':
                                imgType = type;
                                type = '♥';
                                break;
                            case 'diamonds':
                                imgType = type;
                                type = '♦';
                                break;
                        }
                        switch(name){
                            case 1:
                                imgName = 'ace';
                                name = 'A';
                                 break;
                            case 11:
                                imgName = 'jack';
                                 name = 'J';
                                 imgType+='2';
                                break;
                            case 12:
                                imgName = 'queen';
                                 name = 'Q';
                                 imgType+='2';
                                break;
                            case 13:
                                imgName = 'king';
                                 name = 'K';
                                 imgType+='2';
                                 break;
                            default:
                                imgName = name;
                        }
                        return `
                            <div class="card" style="${style}; background-size: contain; background-repeat: no-repeat; background-origin: center; background-image: url('./img/${imgName}_of_${imgType}.png'");>
                                <div data-type="${originType}" hidden>${type}</div>
                                <div data-name="${originName}" hidden>${name}</div>
                            </div>
                        `
                    }
                }
            }

            const view = new View();
            const model = new Model();
            const controller = new Controller();

            view.init(component);
            model.init(view);
            controller.init(model);
        }
    }
})().init();