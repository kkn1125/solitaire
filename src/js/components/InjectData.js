export default {
    init(){
        Object.entries(this.data()).forEach(([key, value])=>{
            this[key] = value;
        });
        // this.render = new Function()
        let datas = this.render.toString().match(/render\(([\s\S]*?)\)/)
        this.render = new Function(datas[1], this.render.toString()
        // .replace(/render\([\s\S]*?\)/gm, '')
        // .replace(/\{([\s\S]+?\s+?)\}/gm, (a,b)=>{
        //     console.log(this.render.toString())
        //     return b.replace(/\{\{([\s\S]+?)\}\}/gm, (x,y)=>{
        //         return this[y];
        //     });
        // }).replace('DataInject.init.call(this);', ''));
        .replace(/render\([\s\S]*?\)/gm, '')
        .replace(/\`([\s\S]+?)\`/gm, (a,b)=>{
            // b = b.replace(/([\$])/gm, '\\$1');
            return '`'+b.replace(/\{\{([\s\S]+?)\}\}/gm, (x,y)=>{
                return this[y];
            })+'`';
        }).replace('DataInject.init.call(this);', ''));
    }
};