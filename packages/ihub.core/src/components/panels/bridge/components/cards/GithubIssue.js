import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import S from '@mui/material/Typography';

// import Link from '../.././../../parts/LinkInSite.js';
import LinkOutSite from '../.././../../parts/LinkOutSite.js';
import { isOverdue } from '../../../../../manegers/nextAction.js';

// 過ぎた NextAction の日付の色。
const OVERDUE_COLOR = '#d32f2f';


export default function GithubIssue (props) {
    const data = props.data;

    const issue = data.data;
    const repository = issue.core().repository;

    // Project の NextAction の日付。(無いときは、出さない)
    const next_action = data.next_action || null;
    const overdue = isOverdue(next_action);

    return (
        <Card sx={{
            width: '222px',
            margin: '11px',
            background: '#fff',
            borderRadius: '5px',
        }}>
          <CardContent>
            <Box>
            <S>
              {issue.title()}
              <span>
                (
                <LinkOutSite href={issue.url()}>
                  {issue.number()}
                </LinkOutSite>
                )
              </span>
            </S>
            </Box>

            <Box sx={{mt:0.5}}>
              <S sx={{color: '#888'}}>
                <a href={repository.url}>
                  {repository.name}
                </a>
              </S>
            </Box>

            {next_action &&
             <Box sx={{mt:0.5}}>
               <S sx={{ color: overdue ? OVERDUE_COLOR : '#888', fontWeight: overdue ? 700 : 400 }}
                  title={overdue ? 'NextAction の日付を過ぎています' : 'NextAction の日付'}>
                 Next: {next_action}
               </S>
             </Box>}
          </CardContent>
        </Card>
    );
}
