import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import S from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

export default function Level2 () {
    return (
        <Box sx={{mt:5}}>
          <S variant="h4">パレット レベル2</S>

          <Card>
            <CardContent>
              <Table2/>
            </CardContent>
          </Card>
        </Box>
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
