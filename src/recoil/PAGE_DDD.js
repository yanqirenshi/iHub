import * as recoil from 'recoil';

const PAGE_DDD = recoil.atom({
    key: "PAGE_DDD",
    default: {
        tabs: {
            selected: 'layer-architecture',
            list: [
                { code: 'ubiquitous-language', label: 'ユビキタス言語' },
                { code: 'model-driven-design', label: 'モデル駆動設計' },
                { code: 'hands-on-modeler',    label: '実践的モデラー' },
                { code: 'declarative-design',  label: '宣言的な設計' },
                { code: 'layer-architecture',  label: 'レイヤーアーキテクチャ' },
                { code: 'overview',            label: 'Overview' },
            ],
        },
    },
});

export default PAGE_DDD;
