// ビジネスのページの Entities のタブの「Entity の追加」のフォーム。(0.12.0 から。叩き台)
//
// フォームのタブ・項目・初めの値・入力の確かめ・保存するレコードの作り方を、ここにまとめる。
// 画面の部品 (components/panels/tm/AddTmEntity.js) は、ENTITY_FORM_TABS と ENTITY_FORM_FIELDS を見て、フォームを組み立てる。
// 項目を足す・消すときは、ENTITY_FORM_FIELDS と buildEntityRecord を直す。(タブを足す・消すときは、ENTITY_FORM_TABS も)
//
// モーダルの形: 左にエンティティのイメージ (d3.ter で描く。previewEntityData)、右にタブ (基本・Identifiers・Attributes)。
//
// どれも、ほかのファイルを読み込まない、ただの関数。(node --test で、そのまま確かめる)

// フォームのタブ。(並びは、タブの並び)
export const ENTITY_FORM_TABS = [
    { code: 'basic',       label: '基本' },
    { code: 'identifiers', label: 'Identifiers' },
    { code: 'attributes',  label: 'Attributes' },
];

// フォームの項目。(並びは、タブの中の並び)
//   key      … 入力の値の鍵
//   label    … 見出し
//   tab      … 置くタブ (ENTITY_FORM_TABS の code)
//   input    … 'entityType' (種別を選ぶ)・'text' (1 行)・'textarea' (複数行)・'masters' (マスタの一覧の表で、チェックで複数を選ぶ)
//   master   … input が 'masters' のとき、選ぶマスタ ('identifiers' か 'attributes')
//   required … 必須か
//   initial  … 初めの値
export const ENTITY_FORM_FIELDS = [
    { key: 'type',        label: '種別',   tab: 'basic',       input: 'entityType', required: true, initial: 'RESOURCE' },
    { key: 'logical',     label: '論理名', tab: 'basic',       input: 'text',       required: true, initial: '' },
    { key: 'physical',    label: '物理名', tab: 'basic',       input: 'text',       initial: '' },
    { key: 'description', label: '説明',   tab: 'basic',       input: 'textarea',   initial: '' },
    { key: 'identifiers', label: '識別子', tab: 'identifiers', input: 'masters', master: 'identifiers', initial: [] },
    { key: 'attributes',  label: '属性',   tab: 'attributes',  input: 'masters', master: 'attributes',  initial: [] },
];

// 誤りのある項目を持つ、初めのタブの code。(誤りが無ければ null。「作成」を押したとき、そのタブに切り替える)
export function firstTabWithError (errors) {
    const tab = ENTITY_FORM_TABS.find(t=> ENTITY_FORM_FIELDS.some(f=> f.tab===t.code && errors?.[f.key]));

    return tab ? tab.code : null;
}

// 新しいエンティティを置く所の、いまあるエンティティからの横のずれ。(図の座標)
export const NEW_ENTITY_GAP_X = 400;

// フォームの初めの値。({ type: 'RESOURCE', logical: '', ... }。開き直したときも、これに戻す)
export function initialEntityForm () {
    return Object.fromEntries(ENTITY_FORM_FIELDS.map(f=> [f.key, Array.isArray(f.initial) ? [...f.initial] : f.initial]));
}

const isBlank = (v)=> v===undefined || v===null || (typeof v==='string' && v.trim()==='') || (Array.isArray(v) && v.length===0);

// 入力の確かめ。誤りのある項目の鍵 → 誤りの文。(誤りが無ければ、空のオブジェクト)
export function validateEntityForm (values) {
    const errors = {};

    for (const f of ENTITY_FORM_FIELDS)
        if (f.required && isBlank(values?.[f.key]))
            errors[f.key] = `${f.label}を入力してください。`;

    return errors;
}

const entitiesOf = (collections)=> {
    const list = collections?.['tm/entities'];

    return Array.isArray(list) ? list.filter(Boolean) : [];
};

// 新しい識別子・属性の行に振る、初めの id。
// 全部のエンティティの行 (identifiers[] と attributes[] の両方) を通して、数の id の最大 + 1。(model.tm の check の決まり: 行の id は、全部を通して重ならない)
// 数でない id (文字列) は、数えない。(新しく振る数の id とは、重ならない) 行が 1 つも無ければ、1。
export function nextRowId (entities) {
    let max = 0;

    for (const e of entities || [])
        for (const row of [...(Array.isArray(e?.identifiers) ? e.identifiers : []), ...(Array.isArray(e?.attributes) ? e.attributes : [])])
            if (typeof row?.id==='number' && Number.isFinite(row.id) && row.id > max)
                max = row.id;

    return max + 1;
}

// 新しいエンティティを置く所。いまあるエンティティの position.x の最大 + NEW_ENTITY_GAP_X、position.y の最小。(重ならないように、右に置く)
// エンティティが無い (位置が数で書かれていない) ときは、{ x: 0, y: 0 }。
export function newEntityPosition (entities) {
    const points = (entities || [])
        .map(e=> e?.position)
        .filter(p=> p && Number.isFinite(p.x) && Number.isFinite(p.y));

    if (points.length===0)
        return { x: 0, y: 0 };

    return {
        x: Math.max(...points.map(p=> p.x)) + NEW_ENTITY_GAP_X,
        y: Math.min(...points.map(p=> p.y)),
    };
}

// 保存するレコード。(id は、API サーバーが振るので、入れない)
//   name        … 物理名が空なら、論理名の文字列。物理名があれば、{ logical, physical } の組
//   description … 空なら、項目を書かない
//   identifiers・attributes … 選んだマスタの id を、行にする。行の id は nextRowId から、識別子・属性の順に振る
//   position・size … newEntityPosition・{ w: 0, h: 0 } (中身に合わせる)
export function buildEntityRecord (values, collections) {
    const entities = entitiesOf(collections);
    const logical = String(values?.logical ?? '').trim();
    const physical = String(values?.physical ?? '').trim();
    const description = String(values?.description ?? '').trim();

    let id = nextRowId(entities);

    const rows = (ids, key)=> (Array.isArray(ids) ? ids : []).map(master=> ({ id: id++, [key]: master }));

    const identifiers = rows(values?.identifiers, 'identifier');
    const attributes = rows(values?.attributes, 'attribute');

    return {
        type: values?.type,
        name: physical ? { logical, physical } : logical,
        ...(description ? { description } : {}),
        position: newEntityPosition(entities),
        size: { w: 0, h: 0 },
        identifiers,
        attributes,
    };
}

// エンティティのイメージの、エンティティの id。(描くだけ。保存はしない)
export const PREVIEW_ENTITY_ID = 'preview';

// エンティティのイメージ (左の枠) に、d3.ter で描くデータ。
// 入力から作るレコード (buildEntityRecord) 1 件と、識別子・属性のマスタ。結線は無し。位置は (0, 0)。
// d3.ter は、渡したデータを書き換えるので、複製して返す。
export function previewEntityData (values, collections) {
    const record = buildEntityRecord(values, collections);
    const list = (name)=> {
        const v = collections?.[name];

        return Array.isArray(v) ? v : [];
    };

    return structuredClone({
        identifiers: list('tm/identifiers'),
        attributes: list('tm/attributes'),
        entities: [{ ...record, id: PREVIEW_ENTITY_ID, position: { x: 0, y: 0 } }],
        relationships: [],
    });
}
