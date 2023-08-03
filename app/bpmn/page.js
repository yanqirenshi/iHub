import Frame from '@/frames/Frame.js';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import S from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import * as data from './DATA.js';

export default function BPMN () {
    return (
        <Frame>
          <Container maxWidth="xl" sx={{pt: 3, pb:22}}>
            <Box>
              <S variant="h5">Overview</S>

              <Box>
                <S>ビジネスプロセスモデリング表記法（英語: Business Process Model and Notation, BPMN）</S>
                <S>参照: <a href="https://ja.wikipedia.org/wiki/%E3%83%93%E3%82%B8%E3%83%8D%E3%82%B9%E3%83%97%E3%83%AD%E3%82%BB%E3%82%B9%E3%83%A2%E3%83%87%E3%83%AA%E3%83%B3%E3%82%B0%E8%A1%A8%E8%A8%98%E6%B3%95">Wikipedia</a></S>
              </Box>

              <Box>
                <S><a href="https://www.iso.org/standard/62652.html">ISO/IEC 19510:2013</a></S>
              </Box>

              <Box>
                <S><a href="https://camunda.com/download/modeler/">camunda-modeler</a></S>
              </Box>

              <Box>
                <S>bpmn-js, react-bpmn を WD で利用</S>
              </Box>

              <Box>
                <S>Icons:https://iconduck.com/sets/bpmn-icons</S>
              </Box>
            </Box>

            <Box sx={{mt:5}}>
              <S variant="h5">パレット レベル1</S>

              <Box sx={{mt:2}}>
                <S variant="h6">アクティビティ</S>
                <Table rows={data.ACTIVITY}/>
              </Box>
              <Box sx={{mt:2}}>
                <S variant="h6">ゲートウェイ</S>
                <Table rows={data.GATEWAY}/>
              </Box>
              <Box sx={{mt:2}}>
                <S variant="h6">開始イベント</S>
                <Table rows={data.EVENT_START}/>
              </Box>
              <Box sx={{mt:2}}>
                <S variant="h6">終了イベント</S>
                <Table rows={data.EVENT_END}/>
              </Box>
              <Box sx={{mt:2}}>
                <S variant="h6">シーケンスフローとメッセージッフロー</S>
                <Table rows={data.FLOWS}/>
              </Box>
              <Box sx={{mt:2}}>
                <S variant="h6">プールとレーン</S>
                <Table rows={data.POOL_LANE}/>
              </Box>
              <Box sx={{mt:2}}>
                <S variant="h6">データオブジェクト、データストア、データ関連</S>
                <Table rows={data.DATA_OBJECT_STORE}/>
              </Box>
              <Box sx={{mt:2}}>
                <S variant="h6">ドキュメンテーション</S>
              </Box>
              <Box sx={{mt:2}}>
                <S variant="h6">アーティファクト</S>
              </Box>
            </Box>

            <Box sx={{mt:5}}>
              <S variant="h5">パレット レベル2</S>
              <Table2/>
            </Box>

            <Box sx={{mt:5}}>
              <S variant="h5">BPMN スタイル</S>
            </Box>
          </Container>
        </Frame>
    );
}

function Table (props) {
    const rows = props.rows;

    return (
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row=> {
                return (
                    <tr>
                      <td>
                        {row.image.map(file_name=> {
                            return (
                                <img src={`/bpmn/${file_name}`}
                                     style={{width:44, height:44}}/>
                            );
                        })}
                      </td>
                      <td>{row.name}</td>
                      <td>
                        {row.description.map((l,i)=> {
                            return <p key={i}>{l}</p>;
                        })}
                      </td>
                    </tr>
                );
            })}
          </tbody>
        </table>
    );
}

function Table2 () {
    return (
        <table>
          <thead>
            <tr>
              <th rowSpan="2">タイプ</th>
              <th colSpan="3">開始</th>
              <th colSpan="4">中間</th>
              <th rowSpan="2">終了</th>
            </tr>

            <tr>
              <th style={{whiteSpace: 'nowrap'}}>
                トップ<br/>レベル
              </th>
              <th style={{whiteSpace: 'nowrap'}}>
                イベント<br/>サブプロセス<br/>(中断)
              </th>
              <th style={{whiteSpace: 'nowrap'}}>
                イベント<br/>サブプロセス<br/>(非中断)
              </th>
              <th style={{whiteSpace: 'nowrap'}}>
                キャッチ
              </th>
              <th style={{whiteSpace: 'nowrap'}}>
                境界<br/>(中断)
              </th>
              <th style={{whiteSpace: 'nowrap'}}>
                境界<br/>(非中断)
              </th>
              <th style={{whiteSpace: 'nowrap'}}>
                フロー
              </th>
            </tr>
          </thead>

          <tbody>
            {data2.map((row,i)=> {
                return (
                    <tr key={i}>
                      <td>{row.type.ja} ({row.type.en})</td>

                      <td>{row.start_events.e1}</td>
                      <td>{row.start_events.e2}</td>
                      <td>{row.start_events.e3}</td>

                      <td>{row.intermediate_events.e1}</td>
                      <td>{row.intermediate_events.e2}</td>
                      <td>{row.intermediate_events.e3}</td>
                      <td>{row.intermediate_events.e4}</td>

                      <td>{row.end_events.e4}</td>
                    </tr>
                );
            })}
          </tbody>
        </table>
    );
}

const data2 = [
    {
        type: { ja: 'なし', en: 'None' },
        start_events: {
            e1: '',
            e2: null,
            e3: null,
        },
        intermediate_events: {
            e1: null,
            e2: null,
            e3: null,
            e4: null,
        },
        end_events: {
            e1: null,
        }
    },
    {
        type: { ja: 'メッセージ', en: 'Message' },
        start_events: {
            e1: null,
            e2: null,
            e3: null,
        },
        intermediate_events: {
            e1: null,
            e2: null,
            e3: null,
            e4: null,
        },
        end_events: {
            e1: null,
        }
    },
    {
        type: { ja: 'タイマー', en: 'Timer' },
        start_events: {
            e1: null,
            e2: null,
            e3: null,
        },
        intermediate_events: {
            e1: null,
            e2: null,
            e3: null,
            e4: null,
        },
        end_events: {
            e1: null,
        }
    },
    {
        type: { ja: 'エラー', en: 'Error' },
        start_events: {
            e1: null,
            e2: null,
            e3: null,
        },
        intermediate_events: {
            e1: null,
            e2: null,
            e3: null,
            e4: null,
        },
        end_events: {
            e1: null,
        }
    },
    {
        type: { ja: 'エスカレーション', en: 'Escalation' },
        start_events: {
            e1: null,
            e2: null,
            e3: null,
        },
        intermediate_events: {
            e1: null,
            e2: null,
            e3: null,
            e4: null,
        },
        end_events: {
            e1: null,
        }
    },
    {
        type: { ja: 'キャンセル', en: 'Cancel' },
        start_events: {
            e1: null,
            e2: null,
            e3: null,
        },
        intermediate_events: {
            e1: null,
            e2: null,
            e3: null,
            e4: null,
        },
        end_events: {
            e1: null,
        }
    },
    {
        type: { ja: '補償', en: 'Compensation' },
        start_events: {
            e1: null,
            e2: null,
            e3: null,
        },
        intermediate_events: {
            e1: null,
            e2: null,
            e3: null,
            e4: null,
        },
        end_events: {
            e1: null,
        }
    },
    {
        type: { ja: '条件', en: 'Conditional' },
        start_events: {
            e1: null,
            e2: null,
            e3: null,
        },
        intermediate_events: {
            e1: null,
            e2: null,
            e3: null,
            e4: null,
        },
        end_events: {
            e1: null,
        }
    },
    {
        type: { ja: 'リンク', en: 'Link' },
        start_events: {
            e1: null,
            e2: null,
            e3: null,
        },
        intermediate_events: {
            e1: null,
            e2: null,
            e3: null,
            e4: null,
        },
        end_events: {
            e1: null,
        }
    },
    {
        type: { ja: 'シグナル', en: 'Signal' },
        start_events: {
            e1: null,
            e2: null,
            e3: null,
        },
        intermediate_events: {
            e1: null,
            e2: null,
            e3: null,
            e4: null,
        },
        end_events: {
            e1: null,
        }
    },
    {
        type: { ja: '停止', en: 'Terminate' },
        start_events: {
            e1: null,
            e2: null,
            e3: null,
        },
        intermediate_events: {
            e1: null,
            e2: null,
            e3: null,
            e4: null,
        },
        end_events: {
            e1: null,
        }
    },
    {
        type: { ja: '多重', en: 'Multiple' },
        start_events: {
            e1: null,
            e2: null,
            e3: null,
        },
        intermediate_events: {
            e1: null,
            e2: null,
            e3: null,
            e4: null,
        },
        end_events: {
            e1: null,
        }
    },
    {
        type: { ja: '多重パラレル', en: 'Parallel Multiple' },
        start_events: {
            e1: null,
            e2: null,
            e3: null,
        },
        intermediate_events: {
            e1: null,
            e2: null,
            e3: null,
            e4: null,
        },
        end_events: {
            e1: null,
        }
    },
];
