const WBS = [
    { id: 1000, parent:    1, name: 'Models', },
    { id: 1001, parent: 1000, name: 'Data Model', },
    { id: 1002, parent: 1000, name: 'Object Model', },
    { id: 1003, parent: 1001, name: '生命', },
    { id: 1004, parent:    1, name: 'Neo4j', },
    { id: 1005, parent: 1004, name: 'Cypher', },
    { id: 1006, parent: 1005, name: 'Syntax', },
    { id: 1007, parent: 1005, name: 'Clauses', },
    { id: 1008, parent: 1005, name: 'Functions', },
    { id: 1009, parent: 1005, name: 'Index', },
    { id: 1010, parent: 1007, name: 'Reading clauses', },
    { id: 1011, parent: 1007, name: 'Projecting clauses', },
    { id: 1012, parent: 1007, name: 'Reading sub-clauses', },
    { id: 1013, parent: 1007, name: 'Reading hints', },
    { id: 1014, parent: 1007, name: 'Writing clauses', },
    { id: 1015, parent: 1007, name: 'Reading/Writing clauses', },
    { id: 1016, parent: 1007, name: 'Set operations', },
    { id: 1017, parent: 1007, name: 'Subquery clauses', },
    { id: 1018, parent: 1007, name: 'Multiple graphs', },
    { id: 1019, parent: 1007, name: 'Importing data', },
    { id: 1020, parent: 1007, name: 'Listing functions and procedures', },
    { id: 1021, parent: 1007, name: 'Transaction Commands', },
    { id: 1022, parent: 1007, name: 'Administration clauses', },
    { id: 1023, parent:    1, name: '辞書', },
    { id: 1024, parent: 1023, name: 'あ', },
    { id: 1025, parent: 1023, name: 'か', },
    { id: 1026, parent: 1023, name: 'さ', },
    { id: 1027, parent: 1023, name: 'た', },
    { id: 1028, parent: 1023, name: 'な', },
    { id: 1029, parent: 1023, name: 'は', },
    { id: 1030, parent: 1023, name: 'ま', },
    { id: 1031, parent: 1023, name: 'や', },
    { id: 1032, parent: 1023, name: 'ら', },
    { id: 1033, parent: 1023, name: 'わ、を、ん', },
    { id: 1034, parent: 1023, name: 'A', },
    { id: 1035, parent: 1023, name: 'B', },
    { id: 1036, parent: 1023, name: 'C', },
    { id: 1037, parent: 1023, name: 'D', },
    { id: 1038, parent: 1023, name: 'E', },
    { id: 1039, parent: 1023, name: 'F', },
    { id: 1040, parent: 1023, name: 'G', },
    { id: 1041, parent: 1023, name: 'H', },
    { id: 1042, parent: 1023, name: 'I', },
    { id: 1043, parent: 1023, name: 'J', },
    { id: 1044, parent: 1023, name: 'K', },
    { id: 1045, parent: 1023, name: 'L', },
    { id: 1046, parent: 1023, name: 'M', },
    { id: 1047, parent: 1023, name: 'N', },
    { id: 1048, parent: 1023, name: 'O', },
    { id: 1049, parent: 1023, name: 'P', },
    { id: 1050, parent: 1023, name: 'Q', },
    { id: 1051, parent: 1023, name: 'R', },
    { id: 1052, parent: 1023, name: 'S', },
    { id: 1053, parent: 1023, name: 'T', },
    { id: 1054, parent: 1023, name: 'U', },
    { id: 1055, parent: 1023, name: 'V', },
    { id: 1056, parent: 1023, name: 'W', },
    { id: 1057, parent: 1023, name: 'X', },
    { id: 1058, parent: 1023, name: 'Y', },
    { id: 1059, parent: 1023, name: 'Z', },
    { id: 1060, parent: 1023, name: '記号', },
    { id: 1061, parent:    1, name: 'Google', },
    { id: 1062, parent: 1061, name: 'Firebase', },
    { id: 1063, parent:    1, name: 'Conoha', },
    { id: 1064, parent:    1, name: 'Page', },
    { id: 1065, parent:    1, name: 'Deployment', },
    { id: 1066, parent:    1, name: 'UI Comonents', },
    { id: 1067, parent:    1, name: 'Peplin', },
    { id: 1068, parent: 1066, name: 'Pages', },
    { id: 1069, parent: 1066, name: 'panels',  description: '製品' },
    { id: 1070, parent: 1066, name: 'modules', description: '中間品' , },
    { id: 1071, parent: 1066, name: 'parts',   description: '部品' },
    { id: 1072, parent:    1, name: 'Panel',   description: '' },
    { id: 1073, parent: 1064, name: '認証', description: '' },
    { id: 1074, parent: 1064, name: '開発者', description: '' },
    { id: 1075, parent: 1072, name: 'タスク管理', description: '' },
    { id: 1076, parent: 1072, name: '構成管理', description: '' },
    { id: 1077, parent: 1072, name: 'うめぇ魚が喰いてぇ', description: '' },
    { id: 1078, parent: 1072, name: '自分管理', description: '' },
    { id: 1079, parent: 1072, name: '管理', description: '' },
    { id: 1080, parent: 1072, name: '情報/データ', description: '' },
    { id: 1081, parent: 1004, name: 'Bolt Protocol', },
    { id: 1082, parent: 1004, name: '使い方', },
];

export default WBS;
