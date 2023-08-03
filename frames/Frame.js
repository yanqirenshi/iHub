import Box from '@mui/material/Box';

// import styles from '@/app/page.module.css';

const sx = {
    width: '100vw',
    height: '100vh',
};

export default function Frame (props) {
    const children = props.children;
    return (
        <Box sx={sx}>
          {children}
        </Box>
    );
}

// <main className={styles.main}>
//   <div className={styles.description}>
//   </div>
// </main>
