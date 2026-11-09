import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';

import { useConfig } from '../../config.js';

// Help。内容は、設定の help.sections (部品の配列) で決める。(既定は、config.js の iHub の 3 つ)
// 各部品は、{ size } (画面に収まる大きさ) を受け取る。
export default function Help () {
    const { help } = useConfig();
    const size = calSize(window.innerWidth, window.innerHeight);

    const options = {
        direction: 'ttb',
        height: '100vh',
        wheel: true,
    };

    return (
        <Splide options={options}
                aria-label="React Splide Example">

          {help.sections.map((Section, index)=> (
              <SplideSlide key={index}>
                <Section size={size}/>
              </SplideSlide>
          ))}

        </Splide>
    );
}

function calSize (w, h) {
    // 19.5:9
    if (w < h) {
        const tmp_h = (9/19.5) * h;

        if (tmp_h < h)
            return {
                w: tmp_h,
                h: h,
            };

        return {
            w: (19.5/9) * h,
            h: h,
        };
    } else {
        const tmp_w = (19.5/9) * h;

        if (tmp_w < w)
            return {
                w: tmp_w,
                h: h,
            };

        return {
            w: w,
            h: (9/19.5) * w,
        };
    }
};
