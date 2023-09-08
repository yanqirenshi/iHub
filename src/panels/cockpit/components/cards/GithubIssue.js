import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import S from '@mui/material/Typography';

export default function GithubIssue (props) {
    const data = props.data;

    const issue = data.data;
    const repository = issue.core().repository;

    return (
        <Card sx={{
            display: 'inline-block',
            width: '222px',
            height: '222px',
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
                <a href={issue.url()}>
                  {issue.number()}
                </a>
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
          </CardContent>
        </Card>
    );
}
