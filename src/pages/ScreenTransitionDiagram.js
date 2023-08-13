import React from 'react';

import Frame from '../frames/Frame.js';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import S from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

export default function ScreenTransitionDiagram () {
    return (
        <Frame>
          <Container maxWidth="lg" sx={{pt: 3, pb:22}}>
            <Box>
              <S variant="h5">(0) システミックデザイン</S>

              <Box>
                <S>デザインジャーニー</S>
                <S>システミックデザイン・ツールキット</S>
              </Box>
            </Box>

            <Box sx={{mt: 3}}>
              <S variant="h5">(1) システムのフレーミングを行う</S>

              <Box sx={{display:'flex', mt: 1}}>
                <Cards list={[
                    'イテレーティブ・インクワイアリー',
                    'アクターズ・マップ',
                    'リッチ コンテクスト',
                    'ニッチ・ディスカバリー',
                ]}/>
              </Box>
            </Box>

            <Box sx={{mt: 3}}>
              <S variant="h5">(2) システムの声を聴く</S>

              <Box sx={{display:'flex', mt: 1}}>
                <Cards list={[
                    'ステーク ホルダー・ディスカバリー',
                    'リサーチクエスチョン',
                    'コンテクスチュアル・インタビュー',
                    'アクタンツ・マップ',
                ]}/>
              </Box>
            </Box>

            <Box sx={{mt: 3}}>
              <S variant="h5">(3) システムを理解する</S>

              <Box sx={{display:'flex', mt: 1}}>
                <Cards list={[
                    'ソーシャルエコシステム・マップ',
                    'マルチキャピタルズ・モデル',
                    'インフルエンス・マップ',
                    'ストーリー ループ・ダイヤグラム',
                    'システムアーキタイプ',
                ]}/>
              </Box>
            </Box>

            <Box sx={{mt: 3}}>
              <S variant="h5">(4) 望ましい未来を思い描く</S>

              <Box sx={{display:'flex', mt: 1}}>
                <Cards list={[
                    'システム バリュー・プロポジション',
                    'スリーホライズン',
                    'パラドキシング',
                    'シンセシス・マップ',
                ]}/>
              </Box>
            </Box>

            <Box sx={{mt: 3}}>
              <S variant="h5">(5) 可能性の空間を探索する</S>

              <Box sx={{display:'flex', mt: 1}}>
                <Cards list={[
                    'フューチャーステート・シナリオ',
                    'インターベンション・ストラテジー',
                    'インターベンション・モデル',
                    'コンテクスチュアル(スペイシャル)・バリエーション',
                    'アウトカム・マップ',
                ]}/>
              </Box>
            </Box>

            <Box sx={{mt: 3}}>
              <S variant="h5">(6) 変革のプロセスをプランニングする</S>

              <Box sx={{display:'flex', mt: 1}}>
                <Cards list={[
                    'セオリー・オブ・システムチェンジ・アンド・アクション',
                    'プロセス・エニアグラム',
                    'チェンジ・レディネス・アセスメント',
                    'エコシステム・ガバナンス',
                ]}/>
              </Box>
            </Box>

            <Box sx={{mt: 3}}>
              <S variant="h5">(7) 移行を促進 する</S>

              <Box sx={{display:'flex', mt: 1}}>
                <Cards list={[
                    'ステークホルダー・モビライゼーション',
                    'トランジション・バイ・デザイン',
                    'コラボレーション・モデル',
                    'アダプティブサイクル',
                ]}/>
              </Box>
            </Box>

            <Box sx={{mt: 3}}>
              <S variant="h5">帰郷：リフレクション</S>

              <Box sx={{display:'flex', mt: 1}}>
                <Cards list={[
                    'システム指向デザイン(SOD)',
                    'ギガマッピングとシンセシスマッピング',
                    'システムズダイアログと参加型デザイン',
                    'システム変革とトランスフォーメーションデザイン',
                    '社会生態システム',
                    '社会システムと組織的ネットワーク',
                    '社会技術的サービスデザイン',
                ]}/>
              </Box>
            </Box>
          </Container>
        </Frame>
    );
}

// https://systemic-design.org/
// https://www.systemicdesigntoolkit.org/

function Cards (props) {
    const list = props.list;

    return list.map(title=> {
        return (
            <Card key={title}>
              <CardContent>
                <S>{title}</S>
              </CardContent>
            </Card>
        );
    });
}
