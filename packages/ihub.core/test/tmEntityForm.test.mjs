// manegers/tmEntityForm.js のテスト。(0.12.0 から。node --test で動かす)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
    ENTITY_FORM_FIELDS, ENTITY_FORM_TABS, NEW_ENTITY_GAP_X, PREVIEW_ENTITY_ID, buildEntityRecord, firstTabWithError, initialEntityForm,
    masterItems, matchesMaster, newEntityPosition, nextRowId, pickerLists, previewEntityData, selectMaster, unselectMaster,
    validateEntityForm,
} from '../src/manegers/tmEntityForm.js';

// 参照アプリの data/tm/entities.json
const ENTITIES = JSON.parse(readFileSync(fileURLToPath(new URL('../../../data/tm/entities.json', import.meta.url)), 'utf8'));

test('initialEntityForm: 項目の定義の初めの値。開き直すたびに、新しい配列', ()=> {
    const a = initialEntityForm();

    assert.deepEqual(a, { type: 'RESOURCE', logical: '', physical: '', description: '', identifiers: [], attributes: [] });
    assert.deepEqual(Object.keys(a), ENTITY_FORM_FIELDS.map(f=> f.key));

    a.identifiers.push(1);
    assert.deepEqual(initialEntityForm().identifiers, []);
});

test('validateEntityForm: 種別と論理名が必須 (空白だけも、空とみなす)', ()=> {
    assert.deepEqual(validateEntityForm(initialEntityForm()), { logical: '論理名を入力してください。' });
    assert.deepEqual(validateEntityForm({ ...initialEntityForm(), logical: '   ' }), { logical: '論理名を入力してください。' });
    assert.deepEqual(validateEntityForm({ ...initialEntityForm(), type: '', logical: '顧客' }), { type: '種別を入力してください。' });
    assert.deepEqual(validateEntityForm({ ...initialEntityForm(), logical: '顧客' }), {});
});

test('nextRowId: 識別子と属性の行を通して、数の id の最大 + 1。行が無ければ 1', ()=> {
    // 参照アプリ: 識別子の行は 100〜104、属性の行は 200 台
    const ids = ENTITIES.flatMap(e=> [...(e.identifiers || []), ...(e.attributes || [])]).map(r=> r.id);

    assert.equal(nextRowId(ENTITIES), Math.max(...ids) + 1);

    assert.equal(nextRowId([{ identifiers: [{ id: 5 }], attributes: [{ id: 3 }] }, { attributes: [{ id: 9 }] }]), 10);
    assert.equal(nextRowId([{ identifiers: [{ id: 'x-1' }, { id: 2 }] }]), 3);
    assert.equal(nextRowId([]), 1);
    assert.equal(nextRowId(undefined), 1);
    assert.equal(nextRowId([{ name: 'E' }]), 1);
});

test('newEntityPosition: x の最大 + 400、y の最小。エンティティが無ければ (0, 0)', ()=> {
    assert.deepEqual(newEntityPosition([{ position: { x: -300, y: -100 } }, { position: { x: 0, y: 50 } }]), { x: NEW_ENTITY_GAP_X, y: -100 });
    assert.deepEqual(newEntityPosition([]), { x: 0, y: 0 });
    assert.deepEqual(newEntityPosition([{ name: '位置が無い' }]), { x: 0, y: 0 });

    const xs = ENTITIES.map(e=> e.position.x);
    const ys = ENTITIES.map(e=> e.position.y);

    assert.deepEqual(newEntityPosition(ENTITIES), { x: Math.max(...xs) + 400, y: Math.min(...ys) });
});

test('buildEntityRecord: 種別・論理名だけ。名前は文字列、説明は書かない、行は空', ()=> {
    const record = buildEntityRecord({ ...initialEntityForm(), logical: ' 顧客 ' }, { 'tm/entities': [] });

    assert.deepEqual(record, {
        type: 'RESOURCE',
        name: '顧客',
        position: { x: 0, y: 0 },
        size: { w: 0, h: 0 },
        identifiers: [],
        attributes: [],
    });
});

test('buildEntityRecord: 物理名があれば名前は組。識別子・属性の行の id は、いまある行の続きから振る', ()=> {
    const collections = {
        'tm/entities': [
            { id: 30000, position: { x: 100, y: 20 }, identifiers: [{ id: 100, identifier: 10000 }], attributes: [{ id: 201, attribute: 20000 }] },
            { id: 30001, position: { x: -50, y: -30 }, identifiers: [{ id: 103, identifier: 10001 }], attributes: [] },
        ],
    };

    const record = buildEntityRecord({
        type: 'EVENT', logical: '注文', physical: 'order', description: ' 説明 ',
        identifiers: [10000, 10001], attributes: [20003],
    }, collections);

    assert.deepEqual(record, {
        type: 'EVENT',
        name: { logical: '注文', physical: 'order' },
        description: '説明',
        position: { x: 500, y: -30 },
        size: { w: 0, h: 0 },
        identifiers: [{ id: 202, identifier: 10000 }, { id: 203, identifier: 10001 }],
        attributes: [{ id: 204, attribute: 20003 }],
    });
});

test('buildEntityRecord: 参照アプリのデータで、新しい行の id が、いまある行と重ならない', ()=> {
    const record = buildEntityRecord({ ...initialEntityForm(), logical: 'X', identifiers: [10000], attributes: [20000, 20001] }, { 'tm/entities': ENTITIES });
    const used = new Set(ENTITIES.flatMap(e=> [...(e.identifiers || []), ...(e.attributes || [])]).map(r=> r.id));
    const added = [...record.identifiers, ...record.attributes].map(r=> r.id);

    assert.equal(added.length, 3);
    assert.equal(new Set(added).size, 3);
    assert.ok(added.every(id=> !used.has(id)), JSON.stringify(added));
});

test('ENTITY_FORM_TABS・ENTITY_FORM_FIELDS: どの項目も、定義のあるタブに置かれる', ()=> {
    const tabs = ENTITY_FORM_TABS.map(t=> t.code);

    assert.deepEqual(tabs, ['basic', 'identifiers', 'attributes']);
    assert.ok(ENTITY_FORM_FIELDS.every(f=> tabs.includes(f.tab)), JSON.stringify(ENTITY_FORM_FIELDS.map(f=> [f.key, f.tab])));
    assert.deepEqual(ENTITY_FORM_FIELDS.filter(f=> f.tab==='basic').map(f=> f.key), ['type', 'logical', 'physical', 'description']);
});

test('firstTabWithError: 誤りのある項目を持つ、初めのタブ。誤りが無ければ null', ()=> {
    assert.equal(firstTabWithError({ logical: '論理名を入力してください。' }), 'basic');
    assert.equal(firstTabWithError({ attributes: 'x' }), 'attributes');
    assert.equal(firstTabWithError({ attributes: 'x', type: 'y' }), 'basic');
    assert.equal(firstTabWithError({}), null);
    assert.equal(firstTabWithError(undefined), null);
});

test('previewEntityData: 入力のレコード 1 件 (位置は原点) と、マスタ。結線は無し。入力のデータは書き換えない', ()=> {
    const collections = {
        'tm/entities': [{ id: 1, position: { x: 100, y: 50 }, identifiers: [{ id: 7, identifier: 10 }] }],
        'tm/identifiers': [{ id: 10, name: 'id' }],
        'tm/attributes': [{ id: 20, name: 'name' }],
        'tm/relationships': [{ id: 1 }],
    };
    const before = structuredClone(collections);

    const data = previewEntityData({ ...initialEntityForm(), logical: '顧客', identifiers: [10], attributes: [20] }, collections);

    assert.deepEqual(data.entities, [{
        type: 'RESOURCE', name: '顧客', id: PREVIEW_ENTITY_ID, position: { x: 0, y: 0 }, size: { w: 0, h: 0 },
        identifiers: [{ id: 8, identifier: 10 }], attributes: [{ id: 9, attribute: 20 }],
    }]);
    assert.deepEqual(data.identifiers, collections['tm/identifiers']);
    assert.notEqual(data.identifiers, collections['tm/identifiers']);
    assert.deepEqual(data.attributes, collections['tm/attributes']);
    assert.deepEqual(data.relationships, []);
    assert.deepEqual(collections, before);

    // 論理名が空・マスタが無いときも、落ちない
    const empty = previewEntityData(initialEntityForm(), {});

    assert.equal(empty.entities[0].name, '');
    assert.deepEqual(empty.identifiers, []);
});

// ---- Identifiers・Attributes のタブの、選ぶ一覧 ----

const PICKER = {
    'tm/identifiers': [
        { id: 10, name: { logical: '顧客番号', physical: 'customer_id' }, description: '顧客を見分ける' },
        { id: 11, name: 'order_no' },
        { id: 12, name: { logical: 'Email', physical: 'EMAIL_ADDRESS' }, description: ['1 行目', 'Mail'] },
    ],
};

test('masterItems: ID・論理名・物理名・説明を、ファイルの順で。文字列の名前は論理名', ()=> {
    assert.deepEqual(masterItems(PICKER, 'identifiers'), [
        { id: 10, logical: '顧客番号', physical: 'customer_id', description: '顧客を見分ける' },
        { id: 11, logical: 'order_no', physical: '', description: '' },
        { id: 12, logical: 'Email', physical: 'EMAIL_ADDRESS', description: '1 行目\nMail' },
    ]);
    assert.deepEqual(masterItems({}, 'attributes'), []);
    assert.deepEqual(masterItems(undefined, 'attributes'), []);
});

test('matchesMaster: 論理名・物理名・ID・説明のどれかに含む。大文字と小文字は区別しない。空なら全部', ()=> {
    const [a, b, c] = masterItems(PICKER, 'identifiers');

    assert.equal(matchesMaster(a, '顧客'), true);          // 論理名
    assert.equal(matchesMaster(a, 'CUSTOMER'), true);      // 物理名 (大文字で)
    assert.equal(matchesMaster(b, '11'), true);            // ID
    assert.equal(matchesMaster(a, '見分け'), true);        // 説明
    assert.equal(matchesMaster(c, 'mail'), true);          // 物理名の EMAIL_ADDRESS (小文字で)
    assert.equal(matchesMaster(b, 'customer'), false);
    assert.equal(matchesMaster(b, ''), true);
    assert.equal(matchesMaster(b, '   '), true);
    assert.equal(matchesMaster(b, undefined), true);
    assert.equal(matchesMaster(a, ' 顧客 '), true);        // 前後の空白は落とす
});

test('pickerLists: 左は選んだ順 (絞り込まない)。右はファイルの順で、選んだものを除き、検索に合うものだけ', ()=> {
    const items = masterItems(PICKER, 'identifiers');

    const none = pickerLists(items, [], '');
    assert.deepEqual(none.selected, []);
    assert.deepEqual(none.available.map(d=> d.id), [10, 11, 12]);

    const some = pickerLists(items, [12, 10], 'order');
    assert.deepEqual(some.selected.map(d=> d.id), [12, 10]);      // 選んだ順。検索では絞り込まない
    assert.deepEqual(some.available.map(d=> d.id), [11]);         // 選んだものを除き、検索に合うもの

    const all = pickerLists(items, [11, 10, 12], '');
    assert.deepEqual(all.available, []);                          // 全部を選び終えた

    const nohit = pickerLists(items, [], 'zzz');
    assert.deepEqual(nohit.available, []);                        // 検索に合うものが無い

    // マスタから消えた id は、id だけの行で残す
    assert.deepEqual(pickerLists(items, [99], '').selected, [{ id: 99, logical: '', physical: '', description: '', missing: true }]);
});

test('selectMaster・unselectMaster: 選ぶと末尾に入り、外すと消える。外したものは、右のファイルの順の位置に戻る', ()=> {
    let ids = [];

    ids = selectMaster(ids, 12);
    ids = selectMaster(ids, 10);
    ids = selectMaster(ids, 10);                 // 2 度は入らない
    assert.deepEqual(ids, [12, 10]);

    ids = unselectMaster(ids, 12);
    assert.deepEqual(ids, [10]);

    const items = masterItems(PICKER, 'identifiers');
    assert.deepEqual(pickerLists(items, ids, '').available.map(d=> d.id), [11, 12]);   // 12 は、ファイルの順の位置に戻る

    assert.deepEqual(unselectMaster(undefined, 1), []);
    assert.deepEqual(selectMaster(undefined, 1), [1]);
});
