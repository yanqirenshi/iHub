// ビジネスのページの Identifiers・Attributes・Relationships のタブの「〜 の追加」のフォームが、保存するレコードを作る。(0.12.0 から。yanqirenshi/iHub#238・#240)
//
// 画面の部品 (components/panels/tm/AddTmMaster.js・AddTmRelationship.js) は、フォームの入力を、ここの関数に渡して、レコードを作る。
// 「Entity の追加」のレコードは、manegers/tmEntityForm.js の buildEntityRecord。
//
// どれも、ただの関数。(ほかのファイルを読み込まない。node --test で、そのまま確かめる)

const textOf = (v)=> String(v ?? '').trim();

// 数の入力。空なら undefined。(入力の欄は整数だけを受け付ける。整数でない値は、API サーバーの検査が誤りにする)
const numberOf = (v)=> {
    const s = textOf(v);

    return s==='' ? undefined : Number(s);
};

// 識別子・属性のマスタの、保存するレコード。(id は、API サーバーが振るので、入れない)
//   values … フォームの入力。{ logical, physical, type, length, scale, description } (どれも文字列)
//   name        … 物理名が空なら、論理名の文字列。物理名があれば、{ logical, physical } の組
//   description … 空なら、書かない
//   data_type   … { type, length, scale } のうち、入れたものだけ。(長さ・小数部の桁数は数) 1 つも無ければ、書かない
export function buildMasterRecord (values) {
    const logical = textOf(values?.logical);
    const physical = textOf(values?.physical);
    const description = textOf(values?.description);
    const type = textOf(values?.type);
    const length = numberOf(values?.length);
    const scale = numberOf(values?.scale);

    const dataType = {
        ...(type ? { type } : {}),
        ...(length!==undefined ? { length } : {}),
        ...(scale!==undefined ? { scale } : {}),
    };

    return {
        name: physical ? { logical, physical } : logical,
        ...(description ? { description } : {}),
        ...(Object.keys(dataType).length > 0 ? { data_type: dataType } : {}),
    };
}

// ---- 結線 ------------------------------------------------------------------------------------------------------------
// 接続位置 (端点の position) は、エンティティの中心から見た角度。0 が真下、時計回りに、90 が左、180 が真上、270 が右。(model.tm の決まり)

// 再帰 (接続元と接続先が同じエンティティ) の接続位置。箱の下に、U 字のループが下がる。(d3.ter の README の例と同じ)
export const LOOP_POSITIONS = { from: 340, to: 20 };

// 位置がわからないときの接続位置。(接続元の右から、接続先の左へ)
export const DEFAULT_POSITIONS = { from: 270, to: 90 };

// エンティティの中心。(大きさが 0 (中身に合わせる) のときは、左上の位置。どちらも図の座標) 位置が数で書かれていなければ null。
function centerOf (entity) {
    const p = entity?.position;

    if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y))
        return null;

    const w = Number.isFinite(entity?.size?.w) ? entity.size.w : 0;
    const h = Number.isFinite(entity?.size?.h) ? entity.size.h : 0;

    return { x: p.x + w / 2, y: p.y + h / 2 };
}

// 2 つのエンティティが向かい合う接続位置。{ from, to }
// 上下左右の 4 つのうち、相手に近い向きを選ぶ。(横のずれと縦のずれの、大きい方。同じなら横)
//   接続先が右なら 270 → 90、左なら 90 → 270、下なら 0 → 180、上なら 180 → 0。(図の y は、下に向かって増える)
// 同じエンティティ (再帰) なら LOOP_POSITIONS。位置がわからない・同じ位置なら DEFAULT_POSITIONS。
export function facingPositions (from, to) {
    if (from && to && from===to)
        return { ...LOOP_POSITIONS };

    const a = centerOf(from);
    const b = centerOf(to);

    if (!a || !b)
        return { ...DEFAULT_POSITIONS };

    const dx = b.x - a.x;
    const dy = b.y - a.y;

    if (dx===0 && dy===0)
        return { ...DEFAULT_POSITIONS };

    if (Math.abs(dx) >= Math.abs(dy))
        return dx > 0 ? { from: 270, to: 90 } : { from: 90, to: 270 };

    return dy > 0 ? { from: 0, to: 180 } : { from: 180, to: 0 };
}

// 結線の端点。{ entity, cardinality?, optionality?, position }
//   end      … フォームの入力。{ entity (エンティティの id), cardinality ('' か '1'・'3'), optionality ('' か '0'・'1') }
//   position … 接続位置 (facingPositions が決めたもの)
function relationshipEnd (end, position) {
    const cardinality = numberOf(end?.cardinality);
    const optionality = numberOf(end?.optionality);

    return {
        entity: end?.entity,
        ...(cardinality!==undefined ? { cardinality } : {}),
        ...(optionality!==undefined ? { optionality } : {}),
        position,
    };
}

// 結線の、保存するレコード。(id は、API サーバーが振るので、入れない)
//   values   … フォームの入力。{ from: { entity, cardinality, optionality }, to: { ... }, type, label, subsetKind, subsetCode, description }
//              entity は、エンティティの id そのもの。(数の id は数、文字列の id は文字列)
//   entities … いまあるエンティティ。(接続位置を決めるのに、位置を見る)
//   from・to … 端点。カーディナリティ・オプショナリティは、選んだときだけ (数)。接続位置は facingPositions
//   type・label・description … 空なら、書かない
//   subset   … 区分 (subsetKind) を選んだときだけ、{ kind, code }
export function buildRelationshipRecord (values, entities) {
    const list = Array.isArray(entities) ? entities.filter(Boolean) : [];
    const find = (id)=> list.find(e=> e.id===id) || null;

    const positions = facingPositions(find(values?.from?.entity), find(values?.to?.entity));

    const type = textOf(values?.type);
    const label = textOf(values?.label);
    const description = textOf(values?.description);
    const subsetKind = textOf(values?.subsetKind);

    return {
        from: relationshipEnd(values?.from, positions.from),
        to: relationshipEnd(values?.to, positions.to),
        ...(type ? { type } : {}),
        ...(label ? { label } : {}),
        ...(subsetKind ? { subset: { kind: subsetKind, code: textOf(values?.subsetCode) } } : {}),
        ...(description ? { description } : {}),
    };
}
