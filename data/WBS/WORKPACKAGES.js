const WORKPACKAGES = [
    { id: 1000000, parent: 1000, name: '画面A', description: '' },
].map(d=> {
    d._class = 'WORKPACKAGE';
    return d;
});

export default WORKPACKAGES;
