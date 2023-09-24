import React from 'react';

import TableContainer from '@mui/material/TableContainer';
import MTable from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import TableCellLinkGithub from '../common/TableCellLinkGithub.js';
import TableCellLinkSogh from '../common/TableCellLinkSogh.js';

export default function Table (props) {
    const data = props.data;
    const sogh = props.sogh;

    return (
        <TableContainer component={Paper}>
          <MTable sx={{ minWidth: 650 }} aria-label="simple table">

            <TableHead>
              <TableRow>
                <TableCell>Number</TableCell>
                <TableCell>Title</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {data.map((id) => {
                  const obj = sogh.projectV2(id);

                  return (
                      <TableRow key={id}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCellLinkGithub data={obj}/>

                        <TableCellLinkSogh to="project-v2" data={obj} sogh={sogh}>
                          {obj.title()}
                        </TableCellLinkSogh>
                      </TableRow>
                  );
              })}
            </TableBody>

          </MTable>
        </TableContainer>
    );
}
