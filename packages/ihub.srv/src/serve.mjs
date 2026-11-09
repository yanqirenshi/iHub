// createApp で作ったアプリを、HTTP で待ち受けさせる。
import { serve as nodeServe } from '@hono/node-server';

// port: 待ち受けるポート。(既定は環境変数 IHUB_API_PORT か 4000)
// app_name: 起動のログに出す名前。
// このパソコンの中からだけ使えるように、127.0.0.1 で待ち受ける。
export function serve (app, { port = Number(process.env.IHUB_API_PORT || 4000), app_name = 'iHub', static_dir = null } = {}) {
    return nodeServe({ fetch: app.fetch, port, hostname: '127.0.0.1' }, info=> {
        console.log(`${app_name} の API サーバーを起動しました: http://127.0.0.1:${info.port}/api/data`);

        if (static_dir)
            console.log(`画面: http://127.0.0.1:${info.port}/`);
    });
}
