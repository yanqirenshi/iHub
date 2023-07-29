export default function Frame (props) {
    const style = {
        width: '100vw',
        height: '100vh',
    };

    return (
        <main style={style}>
          {props.children}
        </main>
    );
}
