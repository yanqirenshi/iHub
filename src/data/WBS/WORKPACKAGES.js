const WORKPACKAGES = [
    { id: 1000000, parent: 1009, name: 'Link', description: '' },
    { id: 1000001, parent: 1009, name: 'Tabs', description: '' },
    { id: 1000002, parent: 1008, name: 'Account', description: '' },
    { id: 1000003, parent: 1008, name: 'Operators', description: '' },
    { id: 1000004, parent: 1008, name: 'WBSTable', description: '' },
    { id: 1000005, parent: 1007, name: 'ER', description: '' },
    { id: 1000006, parent: 1007, name: 'HelpEmpty', description: '' },
    { id: 1000007, parent: 1007, name: 'Loading', description: '' },
    { id: 1000008, parent: 1007, name: 'Procedures', description: '' },
    { id: 1000009, parent: 1007, name: 'TM', description: '' },
    { id: 1000010, parent: 1007, name: 'Wbs', description: '' },
    { id: 1000011, parent: 1011, name: 'Menus', description: '' },
    { id: 1000012, parent: 1011, name: 'Models', description: '' },
    { id: 1000013, parent: 1011, name: 'Operators', description: '' },
    { id: 1000014, parent: 1011, name: 'Pages', description: '' },
    { id: 1000015, parent: 1012, name: 'Methods', description: '' },
    { id: 1000016, parent: 1012, name: 'Overview', description: '' },
    { id: 1000017, parent: 1012, name: 'Palettes', description: '' },
    { id: 1000018, parent: 1012, name: 'Styles', description: '' },
    { id: 1000019, parent: 1013, name: 'Cockpit', description: '' },
    { id: 1000020, parent: 1014, name: 'DeclarativeDesign', description: '' },
    { id: 1000021, parent: 1014, name: 'HandsOnModeler', description: '' },
    { id: 1000022, parent: 1014, name: 'LayerArchitecture', description: '' },
    { id: 1000023, parent: 1014, name: 'ModelDrivenDesign', description: '' },
    { id: 1000024, parent: 1014, name: 'Overview', description: '' },
    { id: 1000025, parent: 1014, name: 'UbiquitousLanguage', description: '' },
    { id: 1000026, parent: 1015, name: 'Assemblies', description: '' },
    { id: 1000027, parent: 1015, name: 'Events', description: '' },
    { id: 1000028, parent: 1015, name: 'Panels', description: '' },
    { id: 1000029, parent: 1015, name: 'Parts', description: '' },
    { id: 1000030, parent: 1019, name: 'ScreenTransitionDiagram', description: '' },
].map(d=> {
    d._class = 'WORKPACKAGE';
    return d;
});

export default WORKPACKAGES;
