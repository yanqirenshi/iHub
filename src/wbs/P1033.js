import React from 'react';
import { useParams, useSearchParams } from "react-router";

import Container from '@mui/material/Container';
import {Section, P, LinkOS} from 'tion'; // , S

import Frame from '../assemblies/frames/FrameWbsNodeTabs.js';
import TableTMRelationships from '../assemblies/TableTMRelationships.js';

import wbs from '../manegers/wbs.js';

export default function P1033 (props) {
    const [searchParams] = useSearchParams();
    const [tab, setTab] = React.useState(searchParams.get('tab') || null);
    const [tabs] = React.useState([
        { code: 'identifier',   label: 'Identifier' },
        { code: 'entity',       label: 'Entity' },
        { code: 'relationship', label: 'Relationship'},
        { code: 'attribute',    label: 'Attribute' },
        { code: 'description',  label: '概要' },
    ]);

    const wbs_node = wbs.get(useParams().wbs_id);

    return (
        <Frame tabs={tabs} tab={tab} onChangeTab={(v)=>setTab(v)}
               wbs_node={wbs_node}>

          <Container maxWidth="lg" sx={{pt:5}}>

            <Section title="本家情報">
              <P>
                <LinkOS href="http://www.sdi-net.co.jp/tm3-1.pdf">
                  [PDF] TM3.0 の技術 (説明資料 ダウンロード)
                </LinkOS>
              </P>

              <P>
                <LinkOS href="https://www.amazon.co.jp/%E4%BA%8B%E6%A5%AD%E5%88%86%E6%9E%90%E3%83%BB%E3%83%87%E3%83%BC%E3%82%BF%E8%A8%AD%E8%A8%88%E3%81%AE%E3%81%9F%E3%82%81%E3%81%AE%E3%83%A2%E3%83%87%E3%83%AB%E4%BD%9C%E6%88%90%E6%8A%80%E8%A1%93%E5%85%A5%E9%96%80-%E4%BD%90%E8%97%A4-%E6%AD%A3%E7%BE%8E/dp/4297129469">
                  [書籍] 事業分析・データ設計のためのモデル作成技術入門
                </LinkOS>
              </P>
            </Section>

            <Section title="Enity">
            </Section>

            <Section title="Relationship">
              <Section lev="5" title="関係の種類">
                <TableTMRelationships/>
              </Section>

              <Section lev="5" title="結線の種類">
                <P>1 対 1</P>
                <img src={process.env.PUBLIC_URL + '/imgs/tm/2024-01-27_130647.png'} alt="/imgs/tm/2024-01-27_130647.png"/>
                <P>1 対 (1 or 値なし)</P>
                <img src={process.env.PUBLIC_URL + '/imgs/tm/2024-01-27_130706.png'} alt="/imgs/tm/2024-01-27_130706.png"/>
                <P>1 対 複数</P>
                <img src={process.env.PUBLIC_URL + '/imgs/tm/2024-01-27_130724.png'} alt="/imgs/tm/2024-01-27_130724.png"/>
                <P>1 対 (複数 or 値なし)</P>
                <img src={process.env.PUBLIC_URL + '/imgs/tm/2024-01-27_130740.png'} alt="/imgs/tm/2024-01-27_130740.png"/>
                <P>対照表、対応表</P>
                <P>再帰</P>
              </Section>
            </Section>

          </Container>

        </Frame>
    );
}
