import * as React from 'react';
import { DataGrid, ColDef, ValueGetterParams } from '@material-ui/data-grid';

const columns: ColDef[] = [
  { field: 'txid', headerName: 'TXID',width:250},
  { field: 'amount', headerName: 'Amount'},
  { field: 'paid', headerName: 'Paid'},
];


export default function PayoutTable({rows} : any) {
  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid rows={rows} columns={columns} pageSize={5} checkboxSelection />
    </div>
  );
}