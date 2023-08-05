"use client";

import Sogh from 'sogh';

const sogh = new Sogh;

sogh.connect(process.env.NEXT_PUBLIC_GITHU_PARSONAL_TOKEN);

export default sogh;
