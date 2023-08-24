import Box from '@mui/material/Box';

function cards () {
    const out = [];

    for (let i=0 ; i< 33 ; i++)
        out.push({ id: i });

    return out;
}

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
            display: 'block',
        }}>

          <Box sx={{
              width: `${column_num * card_width}px`,
              ml: 'auto',
              mr: 'auto',
              pt: 3,
              pb: 22,
          }}>
            {cards().map(card=> (
                <Box key={card.id}
                     className="theme-color3"
                     sx={{display: 'inline-block', width: '222px',height: '222px', margin: '11px'}}/>
            ))}
          </Box>

        </Box>
    );
}
