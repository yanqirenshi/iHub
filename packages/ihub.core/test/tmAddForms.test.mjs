// manegers/tmAddForms.js のテスト。(0.12.0 から。yanqirenshi/iHub#240。node --test で動かす)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
    DEFAULT_POSITIONS, LOOP_POSITIONS, buildMasterRecord, buildRelationshipRecord, facingPositions,
} from '../src/manegers/tmAddForms.js';

// 参照アプリの data/tm/
const DATA = fileURLToPath(new URL('../../../data/tm/', import.meta.url));
const read = (name)=> JSON.parse(readFileSync(`${DATA}${name}.json`, 'utf8'));

// ---- buildMasterRecord -----------------------------------------------------------------------------------------------

const MASTER = { logical: '', physical: '', type: '', length: '', scale: '', description: '' };

test('buildMasterRecord: 論理名だけ。名前は文字列、説明とデータ型は書かない', ()=> {
    assert.deepEqual(buildMasterRecord({ ...MASTER, logical: ' 顧客番号 ' }), { name: '顧客番号' });
});

test('buildMasterRecord: 物理名があれば、名前は論理名と物理名の組', ()=> {
    assert.deepEqual(buildMasterRecord({ ...MASTER, logical: '顧客番号', physical: ' customer_no ', description: ' 顧客に振る番号。 ' }), {
        name: { logical: '顧客番号', physical: 'customer_no' },
        description: '顧客に振る番号。',
    });
});

test('buildMasterRecord: データ型は、入れたものだけ。長さと小数部の桁数は、数 (整数)', ()=> {
    assert.deepEqual(buildMasterRecord({ ...MASTER, logical: '金額', type: ' decimal ', length: '10', scale: '2' }).data_type,
                     { type: 'decimal', length: 10, scale: 2 });
    assert.deepEqual(buildMasterRecord({ ...MASTER, logical: '名前', type: 'varchar', length: '64' }).data_type,
                     { type: 'varchar', length: 64 });
    assert.deepEqual(buildMasterRecord({ ...MASTER, logical: '日時', type: 'timestamp' }).data_type, { type: 'timestamp' });
    assert.deepEqual(buildMasterRecord({ ...MASTER, logical: '桁', scale: '0' }).data_type, { scale: 0 });

    const record = buildMasterRecord({ ...MASTER, logical: '金額', length: '10', scale: '2' });

    assert.ok(Number.isInteger(record.data_type.length));
    assert.ok(Number.isInteger(record.data_type.scale));
});

test('buildMasterRecord: 空白だけの項目は、書かない。(FormData の null も、空とみなす)', ()=> {
    assert.deepEqual(buildMasterRecord({ ...MASTER, logical: '顧客', physical: '  ', type: ' ', length: ' ', description: '\n' }), { name: '顧客' });
    assert.deepEqual(buildMasterRecord({ logical: '顧客', physical: null, type: null, length: null, scale: null, description: null }), { name: '顧客' });
});

// ---- facingPositions -------------------------------------------------------------------------------------------------

const at = (x, y, size)=> ({ position: { x, y }, ...(size ? { size } : {}) });

test('facingPositions: 上下左右の 4 つのうち、相手に近い向き (0=下・90=左・180=上・270=右)', ()=> {
    assert.deepEqual(facingPositions(at(0, 0), at(400, 0)), { from: 270, to: 90 });    // 接続先が右
    assert.deepEqual(facingPositions(at(400, 0), at(0, 0)), { from: 90, to: 270 });    // 接続先が左
    assert.deepEqual(facingPositions(at(0, 0), at(0, 400)), { from: 0, to: 180 });     // 接続先が下
    assert.deepEqual(facingPositions(at(0, 400), at(0, 0)), { from: 180, to: 0 });     // 接続先が上

    // 斜めは、ずれの大きい方。同じなら横
    assert.deepEqual(facingPositions(at(0, 0), at(400, 300)), { from: 270, to: 90 });
    assert.deepEqual(facingPositions(at(0, 0), at(300, -400)), { from: 180, to: 0 });
    assert.deepEqual(facingPositions(at(0, 0), at(-300, 300)), { from: 90, to: 270 });
});

test('facingPositions: 大きさが書いてあれば、中心どうしで比べる', ()=> {
    // 左上どうしでは右 (dx 100 > dy 0) だが、中心どうしでは下 (dx 100 < dy 450)
    assert.deepEqual(facingPositions(at(0, 0, { w: 400, h: 100 }), at(100, 0, { w: 200, h: 1000 })), { from: 0, to: 180 });
    // 大きさ 0 (中身に合わせる) は、左上
    assert.deepEqual(facingPositions(at(0, 0, { w: 0, h: 0 }), at(100, 0, { w: 0, h: 0 })), { from: 270, to: 90 });
});

test('facingPositions: 同じエンティティ (再帰) は、箱の下のループ。位置がわからない・同じ位置なら、右から左', ()=> {
    const e = at(0, 0);

    assert.deepEqual(facingPositions(e, e), LOOP_POSITIONS);
    assert.deepEqual(LOOP_POSITIONS, { from: 340, to: 20 });

    assert.deepEqual(DEFAULT_POSITIONS, { from: 270, to: 90 });
    assert.deepEqual(facingPositions(null, at(0, 0)), DEFAULT_POSITIONS);
    assert.deepEqual(facingPositions(at(0, 0), { name: '位置が無い' }), DEFAULT_POSITIONS);
    assert.deepEqual(facingPositions(at(0, 0), { position: { x: '1', y: 2 } }), DEFAULT_POSITIONS);
    assert.deepEqual(facingPositions(at(5, 5), at(5, 5)), DEFAULT_POSITIONS);
    assert.deepEqual(facingPositions(undefined, undefined), DEFAULT_POSITIONS);

    // 返す値は、毎回新しいオブジェクト (書き換えても、定数は変わらない)
    facingPositions(e, e).from = 0;
    assert.deepEqual(LOOP_POSITIONS, { from: 340, to: 20 });
});

// ---- buildRelationshipRecord -----------------------------------------------------------------------------------------

const ENTITIES = [
    { id: 1, ...at(0, 0) },
    { id: 2, ...at(400, 0) },
    { id: 'e-3', ...at(0, 400) },
];

const end = (entity, cardinality = '', optionality = '')=> ({ entity, cardinality, optionality });
const RELATIONSHIP = { from: end(1), to: end(2), type: '', label: '', subsetKind: '', subsetCode: '', description: '' };

test('buildRelationshipRecord: 両端と接続位置だけ。空の項目は書かない', ()=> {
    assert.deepEqual(buildRelationshipRecord(RELATIONSHIP, ENTITIES), {
        from: { entity: 1, position: 270 },
        to: { entity: 2, position: 90 },
    });
});

test('buildRelationshipRecord: カーディナリティ・オプショナリティは、選んだときだけ (数)。文字列の id もそのまま', ()=> {
    const record = buildRelationshipRecord({ ...RELATIONSHIP, from: end(1, '1', '1'), to: end('e-3', '3', '0') }, ENTITIES);

    assert.deepEqual(record.from, { entity: 1, cardinality: 1, optionality: 1, position: 0 });
    assert.deepEqual(record.to, { entity: 'e-3', cardinality: 3, optionality: 0, position: 180 });
});

test('buildRelationshipRecord: 種類・ラベル・説明は、前後の空白を落とし、空なら書かない', ()=> {
    const record = buildRelationshipRecord({ ...RELATIONSHIP, type: ' 対応 ', label: ' 所属する ', description: ' 説明 ' }, ENTITIES);

    assert.equal(record.type, '対応');
    assert.equal(record.label, '所属する');
    assert.equal(record.description, '説明');
    assert.deepEqual(Object.keys(record), ['from', 'to', 'type', 'label', 'description']);
});

test('buildRelationshipRecord: サブセットは、区分を選んだときだけ。区分コードは前後の空白を落とす', ()=> {
    assert.deepEqual(buildRelationshipRecord({ ...RELATIONSHIP, subsetKind: 'same', subsetCode: ' 承諾 ' }, ENTITIES).subset,
                     { kind: 'same', code: '承諾' });
    assert.deepEqual(buildRelationshipRecord({ ...RELATIONSHIP, subsetKind: 'different', subsetCode: 'X' }, ENTITIES).subset,
                     { kind: 'different', code: 'X' });
    assert.equal('subset' in buildRelationshipRecord({ ...RELATIONSHIP, subsetCode: '承諾' }, ENTITIES), false);
});

test('buildRelationshipRecord: 自己結線はループ。見つからないエンティティ・エンティティが無いときは、右から左', ()=> {
    const loop = buildRelationshipRecord({ ...RELATIONSHIP, to: end(1) }, ENTITIES);

    assert.equal(loop.from.position, 340);
    assert.equal(loop.to.position, 20);

    const missing = buildRelationshipRecord({ ...RELATIONSHIP, to: end(99) }, ENTITIES);

    assert.deepEqual([missing.from.position, missing.to.position], [270, 90]);
    assert.deepEqual(buildRelationshipRecord(RELATIONSHIP, undefined).from, { entity: 1, position: 270 });
    assert.deepEqual(buildRelationshipRecord(RELATIONSHIP, [null]).from, { entity: 1, position: 270 });
});

test('buildRelationshipRecord: 参照アプリのいまの結線と、同じ接続位置になる (左右・上下に並ぶもの)', ()=> {
    const entities = read('entities');
    const relationships = read('relationships').filter(r=> !r.subset && r.from.position!==undefined && r.to.position!==undefined);

    assert.ok(relationships.length > 0);

    for (const r of relationships) {
        const record = buildRelationshipRecord({ ...RELATIONSHIP, from: end(r.from.entity), to: end(r.to.entity) }, entities);

        assert.deepEqual([record.from.position, record.to.position], [r.from.position, r.to.position], `relationship ${r.id}`);
    }
});
