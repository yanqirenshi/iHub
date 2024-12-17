import React from 'react';
import { useParams } from "react-router";

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import {Section, P, S} from 'tion';

import Frame from '../assemblies/frames/FrameWbsNode.js';
import HeadWbsPage from '../parts/HeadWbsPage.js';
import WBSTable from '../assemblies/WBSTable.js';

import wbs from '../manegers/wbs.js';

export default function P1031 (props) {
    let num = 1;

    return (
        <Frame>

          <Container maxWidth="lg" sx={{pt:5}}>

            <Section title="デザインジャーニー:目的地までの7ステージ">
              <Section lev="5" num={`(${num++})`} title="システムのフレーミングを行う">
                <P>イテレーティブ·インクワイアリー</P>
                <P>アクターズ·マップ</P>
                <P>リッチコンテクスト</P>
                <P>ニッチディスカバリー</P>
              </Section>

              <Section lev="5" num={`(${num++})`} title="システムの声を聴く">
                <P>ステークホルダー·ディスカバリー</P>
                <P>リサーチクエスチョン</P>
                <P>コンテクスチュアル·インタビュー</P>
                <P>アクタンツ·マップ</P>
              </Section>

              <Section lev="5" num={`(${num++})`} title="システムを理解する">
                <P>ソーシャルエコシステム·マップ</P>
                <P>マルチキャピタルズ·モデル</P>
                <P>インフルエンス·マップ</P>
                <P>ストーリーループ·ダイヤグラム</P>
                <P>システムアーキ·タイプ</P>
              </Section>

              <Section lev="5" num={`(${num++})`} title="望ましい未来を思い描く">
                <P>システムバリュー·ブロボジション</P>
                <P>スリーホライズン</P>
                <P>パラドキシング</P>
                <P>シンセシス·マップ</P>
              </Section>

              <Section lev="5" num={`(${num++})`} title="可能性の空間を探索する">
                <P>フューチャーステート·シナリオ</P>
                <P>インターベンション·ストラテジー</P>
                <P>インターベンション·モデル</P>
                <P>コンテクスチュアル(スペイシャル)·バリエーション</P>
                <P>アウトカム·マップ</P>
              </Section>

              <Section lev="5" num={`(${num++})`} title="変革のプロセスをプランニングする">
                <P>セオリー·オブ·システムチェンジ·アンド·アクション</P>
                <P>ブロセス·エニアグラム</P>
                <P>チェンジ·レディネス·アセスメント</P>
                <P>エコシステム·ガバナンス</P>
              </Section>

              <Section lev="5" num={`(${num++})`} title="移行を促進する">
                <P>ステークホルダー·モビライゼーション</P>
                <P>トランジション·バイ·デザイン</P>
                <P>コラボレーション·モデル</P>
                <P>アダプティブ·サイクル</P>
              </Section>
            </Section>
          </Container>

        </Frame>
    );
}
