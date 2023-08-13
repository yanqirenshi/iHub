import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useRecoilValue, useRecoilState } from "recoil";

import Box from '@mui/material/Box';

import Account from './assemblies/Account.js';
import Operators from './assemblies/Operators.js';

import * as page from './pages/index.js';

import * as atoms from './recoil/ATOMS.js';

export default function App () {
    const [window_size, setWindowSize] = useRecoilState(atoms.WINDOW);
    const [account_menu, setAccountMenu] = useRecoilState(atoms.ACCOUNT_MENU);

    const operators = useRecoilValue(atoms.OPERATORS);

    const actions = {
        menu: {
            change: (new_menu)=> setAccountMenu(new_menu),
        },
    };

    React.useEffect(()=> {
        const handleResize = ()=> setWindowSize({w: window.innerWidth, h: window.innerHeight});
        handleResize();

        window.addEventListener("resize", handleResize);
    }, [setWindowSize]); // TODO: これなぁ。。。

    return (
        <Box>
          <Account menu={account_menu} actions={actions}/>
          <Operators operators={operators} window_size={window_size}/>

          <Routes>
            {/* == iHub ================================================================ */}
            <Route path='/'                          element={<page.Cockpit/>} />
            <Route path='/markets'                   element={<page.Markets/>} />
            <Route path='/business'                  element={<page.Business/>} />
            <Route path='/design'                    element={<page.Design/>} />
            <Route path='/screens'                   element={<page.Screens/>} />
            <Route path='/data'                      element={<page.Data/>} />
            <Route path='/classes'                   element={<page.Classes/>} />
            <Route path='/system-environment'        element={<page.SystemEnvironment/>} />
            <Route path='/message'                   element={<page.Messages/>} />
            <Route path='/devops'                    element={<page.DevOps/>} />
            <Route path='/wbs'                       element={<page.Wbs/>} />
            <Route path='/scrum'                     element={<page.Scrum/>} />
            {/* == Docs ================================================================ */}
            {/* ux */}
            <Route path='/user-scenario'             element={<page.UserScenario/>} />
            <Route path='/customer-journey-map'      element={<page.CustomerJourneyMap/>} />
            <Route path='/use-case'                  element={<page.UseCase/>} />
            <Route path='/systemic-design'           element={<page.SystemicDesign/>} />
            <Route path='/systemic-design/:name'     element={<page.SystemicDesignContents/>} />
            <Route path='/bpmn'                      element={<page.BPMN/>} />
            {/* == ui ================================================================ */}
            {/* { path: '/screens'                   element={page }, */}
            {/* { path: '/assemblies'                element={page }, */}
            {/* { path: '/parts'                     element={page }, */}
            <Route path='/batchs'                    element={<page.Batchs/>} />
            <Route path='/actions'                   element={<page.Actions/>} />
            <Route path='/screen-transition-diagram' element={<page.ScreenTransitionDiagram/>} />
            {/* == Application ================================================================ */}
            <Route path='/classes'                   element={<page.Classes/>} />
            <Route path='/procedures'                element={<page.Procedures/>} />
            {/* == Model ================================================================ */}
            <Route path='/tm'                        element={<page.TM/>} />
            <Route path='/er'                        element={<page.ER/>} />
            <Route path='/uml'                       element={<page.UML/>} />
            {/* == Etc ================================================================ */}
            <Route path='/system-dynamics'           element={<page.SystemDynamics/>} />
            <Route path='/ddd'                       element={<page.DDD/>} />
            <Route path='/account'                   element={<page.Account/>} />
            <Route path='/auth'                      element={<page.Auth/>} />
          </Routes>
        </Box>
    );
}
