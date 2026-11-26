// ビジネスのページの、TM のデータを表で見るタブ (Entities・Identifiers・Attributes・Relationships) の行を作る。(0.12.0 から)
//
// どれも、ほかのファイルを読み込まない、ただの関数。(node --test で、そのまま確かめる)
// 入力は、API サーバーから読んだコレクション ({ 'tm/entities': [...], ... })。ファイルが無い・形が違うときは、空として扱う。
// 並びは、ファイルの順のまま。(並べ替え・絞り込みはしない)
// 指す先が見つからないとき (無い id) は、id をそのまま文字にする。(落ちない)

export const TM_TABLE_COLLECTIONS = {
    entities:      'tm/entities',
    identifiers:   'tm/identifiers',
    attributes:    'tm/attributes',
    relationships: 'tm/relationships',
};

const listOf = (collections, key)=> {
    const list = collections?.[TM_TABLE_COLLECTIONS[key]];

    return Array.isArray(list) ? list : [];
};

// 値を、表に出す文字にする。(null・undefined は空)
const textOf = (v)=> v===undefined || v===null ? '' : String(v);

// 名前を、表に出す文字にする。
//   文字列 … そのまま
//   { logical, physical } … 「論理名 (物理名)」。どちらかしか無ければ、ある方。同じなら 1 つ。
//   それ以外 … 空
export function nameText (name) {
    if (typeof name==='string')
        return name;

    if (!name || typeof name!=='object')
        return '';

    const logical = textOf(name.logical);
    const physical = textOf(name.physical);

    if (logical && physical && logical!==physical)
        return `${logical} (${physical})`;

    return logical || physical;
}

// id → レコード の表。(同じ id が重なるときは、先のもの)
function indexById (list) {
    const map = new Map();

    for (const d of list)
        if (d && !map.has(d.id))
            map.set(d.id, d);

    return map;
}

// エンティティが持つ識別子・属性の行 (identifiers[] / attributes[] の要素) の名前。
// 行に name があればそれ、無ければ、参照しているマスタ (key の id) の名前。マスタが無ければ、その id。
function instanceName (row, key, masters) {
    if (row?.name!==undefined && row?.name!==null && nameText(row.name)!=='')
        return nameText(row.name);

    const master = masters.get(row?.[key]);

    return master ? nameText(master.name) : textOf(row?.[key]);
}

// エンティティの名前。(見つからないときは、id)
function entityName (id, entities) {
    const entity = entities.get(id);

    return entity ? nameText(entity.name) : textOf(id);
}

// Entities のタブの行。
//   { id, type, name, identifiers: [名前], attributes: [名前], description }
// position・size (図の上の位置と大きさ) は、出さない。
export function entityRows (collections) {
    const identifiers = indexById(listOf(collections, 'identifiers'));
    const attributes = indexById(listOf(collections, 'attributes'));

    return listOf(collections, 'entities').filter(Boolean).map(d=> ({
        id: textOf(d.id),
        type: textOf(d.type),
        name: nameText(d.name),
        identifiers: (Array.isArray(d.identifiers) ? d.identifiers : []).map(r=> instanceName(r, 'identifier', identifiers)),
        attributes: (Array.isArray(d.attributes) ? d.attributes : []).map(r=> instanceName(r, 'attribute', attributes)),
        description: textOf(d.description),
    }));
}

// Identifiers・Attributes のタブの行。
//   { id, name, description, entities: [この識別子 (属性) を持つエンティティの名前] }
//   kind … 'identifiers' か 'attributes'
// エンティティは、entities.json の順。1 つのエンティティが同じマスタを 2 度持っていても、1 度だけ出す。どこからも使われていなければ、空。
export function masterRows (collections, kind) {
    const key = kind==='identifiers' ? 'identifier' : 'attribute';
    const users = new Map();

    for (const entity of listOf(collections, 'entities')) {
        for (const row of (Array.isArray(entity?.[kind]) ? entity[kind] : [])) {
            const id = row?.[key];
            const list = users.get(id) || [];

            if (!list.includes(entity))
                list.push(entity);

            users.set(id, list);
        }
    }

    return listOf(collections, kind).filter(Boolean).map(d=> ({
        id: textOf(d.id),
        name: nameText(d.name),
        description: textOf(d.description),
        entities: (users.get(d.id) || []).map(e=> nameText(e.name) || textOf(e.id)),
    }));
}

// サブセットを、表に出す文字にする。(「区分・区分コード」。どちらかしか無ければ、ある方。無ければ空)
export function subsetText (subset) {
    if (!subset || typeof subset!=='object')
        return '';

    return [textOf(subset.kind), textOf(subset.code)].filter(Boolean).join('・');
}

// Relationships のタブの行。
//   { id, type, from: 接続元のエンティティの名前, to: 接続先のエンティティの名前, label, subset, description }
// from・to の位置 (角度)・カーディナリティ・オプショナリティ、details・mapping は、出さない。
export function relationshipRows (collections) {
    const entities = indexById(listOf(collections, 'entities'));

    return listOf(collections, 'relationships').filter(Boolean).map(d=> ({
        id: textOf(d.id),
        type: textOf(d.type),
        from: entityName(d.from?.entity, entities),
        to: entityName(d.to?.entity, entities),
        label: textOf(d.label),
        subset: subsetText(d.subset),
        description: textOf(d.description),
    }));
}
