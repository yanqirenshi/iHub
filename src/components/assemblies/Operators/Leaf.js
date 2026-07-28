import Box from '@mui/material/Box';

export default function Leaf (props) {
    const root = props.root;

    const sample_width  = 400;
    const sample_height = 300;
    const sample_branch_h = 33;

    const w_center = root.position.x + (root.size.w / 2);

    const x = w_center - (sample_width / 2);
    const y = root.position.y - sample_branch_h - sample_height;

    return (
        <Box className="pair-color1"
             sx={{
                 position: 'fixed',
                 left: x,
                 top:  y,
                 padding: '3px',
                 borderRadius: '8px',
             }}>

          <Box sx={{
              background: '#fff',
              width: sample_width,
              height: sample_height,
              borderRadius: '6px',
          }}>
          </Box>

        </Box>
    );
}
