import React from 'react';

import Table from './project_next_items/Table.js';

const style = {
    overflow: 'auto',
};

export default function ProjectV2Items (props) {
    const data = props.data;
    const sogh = props.sogh;

    const fields = data ? data.fields : [];
    const statuses = toStatuses (sogh, data ? data.items : []);

    const keys = Object.keys(statuses).sort((a,b)=>a<b ? 1 : -1);

    return (
        <div style={style}>
          {keys.map(key=> {
              const items = statuses[key];

              return (
                  <div key={key} style={{marginTop:11, marginBottom:55}}>
                    <div>
                      <h2>{key}</h2>
                    </div>

                    <div>
                    <Table fields={fields}
                           items={items.detail}
                           sogh={sogh}/>
                    </div>
                  </div>
              );
          })}
        </div>
    );
}

function toStatuses (sogh, items) {
    return items.reduce((ht, item_id)=> {
        const item = sogh.projectV2Item(item_id);
        const status = item.status();

        if (!ht[status])
            ht[status] = {
                data: status,
                detail: [],
            };

        ht[status].detail.push(item_id);

        return ht;
    }, {});
}
