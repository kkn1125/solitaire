import DataInject from './InjectData.js';

const SGround = {
    data(){
        return {
            stores: `
            <div class="stores">
            </div>
            `,
            stacks: `
            <div class="stacks">

            </div>
            `,
            decks: `
            <div class="decks">

            </div>
            `,
        }
    },
    render(data){
        return `
        <div class="ground">
            <div class="row">
                {{stores}}
                {{stacks}}
            </div>
            <div class="row">
                {{decks}}
            </div>
        </div>
        `
    }
}

DataInject.init.call(SGround);
export {SGround};