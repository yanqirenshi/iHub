import Box from '@mui/material/Box';

export default function Cockpit (props) {
    const window_size = props.window_size;

    if (!window_size)
        return null;

    const contents_width = 222;
    const margin = 11;
    const card_width = contents_width + (margin * 2);

    const column_num = Math.ceil(window_size.w / card_width) - 2;

    return (
        <Box sx={{
            width: `${window_size.w}px`,
            height: `${window_size.h}px`,
            overflow: 'auto',
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '11px',
        }}>

          <Box sx={{
              width: `${column_num * card_width}px`,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-start',
          }}>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
            <Box sx={{width: '222px',height: '222px',background: '#eee', margin: '11px'}}/>
          </Box>

        </Box>
    );
}
