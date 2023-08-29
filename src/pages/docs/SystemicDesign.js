import React from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import S from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import Frame from '../../frames/Frame.js';
import Link from '../../parts/Link.js';

export default function SystemicDesign () {
    return (
        <Frame>
          <Container maxWidth="md" sx={{pt: 3, pb:22}}>
            {data.map(row=> {
                return (
                    <Box sx={{mt: 3}}>
                      <S variant="h5">{row.label}</S>

                      <Box sx={{display:'flex', mt: 1, flexWrap:'wrap'}}>
                        <Cards list={row.cards}/>
                      </Box>
                    </Box>
                );
            })}
          </Container>
        </Frame>
    );
}

// https://systemic-design.org/
// https://www.systemicdesigntoolkit.org/

function Cards (props) {
    const list = props.list;

    return list.map(card=> {
        return (
            <Card key={card.label} sx={{width:166, m:1}}>
              <CardContent>
                {!card.code && <S>{card.label}</S>}
                {card.code  && <S><Link href={`/systemic-design/${card.code}`}>{card.label}</Link></S>}
              </CardContent>
            </Card>
        );
    });
}

const data = [
    {
        label: 'システミックデザイン',
        cards: [
            { code: null, label: 'デザインジャーニー' },
            { code: null, label: 'システミックデザイン・ツールキット' },
        ],
    },
    {
        label: 'システムのフレーミングを行う',
        cards: [
            { code: 'ITERATIVE_INQUIRY', label: 'イテレーティブ・インクワイアリー' },
            { code: 'ACTORS_MAP', label: 'アクターズ・マップ' },
            { code: 'RICH_CONTEXT', label: 'リッチ コンテクスト' },
            { code: 'NICHE_DISCOVERY', label: 'ニッチ・ディスカバリー' },
        ],
    },
    {
        label: 'システムの声を聴く',
        cards: [
            { code: 'STAKEHOLDER_DIMENSIONS', label: 'ステーク ホルダー・ディスカバリー' },
            { code: 'RESEARCH_QUESTIONS', label: 'リサーチクエスチョン' },
            { code: 'CONTEXTUAL_INTERVIEW', label: 'コンテクスチュアル・インタビュー' },
            { code: 'ACTANTS_MAP', label: 'アクタンツ・マップ' },
        ],
    },
    {
        label: 'システムを理解する',
        cards: [
            { code: 'SOCIAL_ECOSYSTEM', label: 'ソーシャルエコシステム・マップ' },
            { code: 'MULTICAPITALS_SYSTEMS_MAP', label: 'マルチキャピタルズ・モデル' },
            { code: 'INFLUENCE_MAP', label: 'インフルエンス・マップ' },
            { code: 'STORY_LOOP_DIAGRAM', label: 'ストーリー ループ・ダイヤグラム' },
            { code: 'SYSTEMS_MAP', label: 'システムアーキタイプ' },
        ],
    },
    {
        label: '望ましい未来を思い描く',
        cards: [
            { code: 'VALUE_PROPOSITION', label: 'システム バリュー・プロポジション' },
            { code: 'THREE_HORIZONS', label: 'スリーホライズン' },
            { code: null, label: 'パラドキシング' },
            { code: null, label: 'シンセシス・マップ' },
        ],
    },
    {
        label: '可能性の空間を探索する',
        cards: [
            { code: 'FUTURE_STATE_SCENARIOS', label: 'フューチャーステート・シナリオ' },
            { code: 'INTERVENTION_STRATEGY', label: 'インターベンション・ストラテジー' },
            { code: null, label: 'インターベンション・モデル' },
            { code: 'CONTEXTUAL_VARIATIONS', label: 'コンテクスチュアル(スペイシャル)・バリエーション' },
            { code: null, label: 'アウトカム・マップ' },
        ],
    },
    {
        label: '変革のプロセスをプランニングする',
        cards: [
            { code: 'THEORY_OF_SYSTEMS_CHANGE_AND_ACTION', label: 'セオリー・オブ・システムチェンジ・アンド・アクション' },
            { code: 'PROCESS_ENNEAGRAM', label: 'プロセス・エニアグラム' },
            { code: 'CHANGE_READINESS', label: 'チェンジ・レディネス・アセスメント' },
            { code: 'ECOSYSTEM_GOVERNANCE', label: 'エコシステム・ガバナンス' },
        ],
    },
    {
        label: '移行を促進する',
        cards: [
            { code: 'STAKEHOLDER_MOBILISATION', label: 'ステークホルダー・モビライゼーション' },
            { code: 'ROADMAP_FOR_TRANSITION_BY_DESIGN', label: 'トランジション・バイ・デザイン' },
            { code: 'COLLABORATION_MODEL', label: 'コラボレーション・モデル' },
            { code: 'ADAPTIVE_CYCLE_STRATEGY', label: 'アダプティブサイクル' },
        ],
    },
    {
        label: '帰郷：リフレクション',
        cards: [
            { code: null, label: 'システム指向デザイン(SOD)' },
            { code: null, label: 'ギガマッピングとシンセシスマッピング' },
            { code: null, label: 'システムズダイアログと参加型デザイン' },
            { code: null, label: 'システム変革とトランスフォーメーションデザイン' },
            { code: null, label: '社会生態システム' },
            { code: null, label: '社会システムと組織的ネットワーク' },
            { code: null, label: '社会技術的サービスデザイン' },
        ],
    },
];
