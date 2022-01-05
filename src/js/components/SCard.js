import DataInject from './InjectData.js';

const SStacking = {
    data(){
        return {

        }
    },
    render(){
        return `
            <div class="stacking">
                <div class="card">
                </div>
            </div>
        `
    }
}

const SCard = {
    data(){
        return {
            class: 'card',
        }
    },
    render(data, idx=0){
        let convertNum=data?.num;
        let convertType=data?.type;

        if(data?.num==1) convertNum = 'ace'
        if(data?.num==11) {
            convertNum = 'jack';
            convertType=data.type+'2';
        }
        if(data?.num==12) {
            convertNum = 'queen';
            convertType=data.type+'2';
        }
        if(data?.num==13) {
            convertNum = 'king';
            convertType=data.type+'2';
        }
        return `
        <div
        ${data?.id?`data-card-id="${data.id}"`:''}
        class="{{class}} ${data?.isPick?'active':''} ${data?.isBack!=undefined&&data.isBack==true?'back':'front'}"
        style="${idx>0?'top:'+idx*20+'px;':idx<0?'left:'+Math.abs(idx)+'px;':''}${data?.type&&data?.num?`background-image: url('../src/img/${convertNum}_of_${convertType}.png')`:''}"
        ${data?.type?`data-card-type="${data.type}"`:''}
        ${data?.num?`data-card-num="${data.num}"`:''}
        ></div>
        `
    }
}

DataInject.init.call(SCard);
export {SCard, SStacking};