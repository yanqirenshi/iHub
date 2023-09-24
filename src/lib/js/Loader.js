export default class Loader {
    constructor () {
        this._token = null;

        this._viewer = null;

        this._endpoint = 'https://api.github.com/graphql';

        this._api = {
            v4: null,
        };
    }
    endpoint () {
        return this._endpoint;
    }
    /** *************************************************************** *
     *  Auth
     * **************************************************************** */
    token (v) {

        if (arguments.length > 0)
            this._token = v;

        return this._token;
    }
    viewer (v) {
        if (arguments.length > 0){
            this._viewer = v;
        }

        return this._viewer;
    }
    isConnected () {
        return this.viewer() !== null;
    }
    /** *************************************************************** *
     *  Query
     * **************************************************************** */
    makeQuery (query, endCursor) {
        if (endCursor)
            return query.replace('after: "",', `after: "${endCursor}",`);

        return query.replace('after: "",', '');
    }
    // 廃止予定
    ensureEndCursor (query, endCursor) {
        return this.makeQuery(query,endCursor);
    }
    /** *************************************************************** *
     *  Api
     * **************************************************************** */
    makeHeader () {
        return {
            'Authorization': `bearer ${this.token()}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
    }
    postData (query) {
        return {
            method: 'POST',
            headers: this.makeHeader(),
            body: JSON.stringify({query: query})
        };
    }
    fetch (query, success, error) {
        const endpoint = 'https://api.github.com/graphql';
        const post_data = this.postData(this._token, query);

        // Promis を返す
        return fetch(endpoint, post_data)
            .then(r => r.ok ? r.json() : Promise.reject(r))
            .then(r => {
                const out = { status: 'success', data: r.data };

                // コールバック関数に結果を返す。
                // SOGH の処理用。
                if (success) success(out);

                return out;
            })
            .catch(err => {
                const out = { status: 'error', error };

                // コールバック関数に結果を返す。
                // SOGH の処理用。
                error ? error(out) : console.error(err);

                return out;
            });
    }
    fetchX (query, response2data, success, error) {
        const endpoint = 'https://api.github.com/graphql';
        const post_data = this.postData(query);

        return fetch(endpoint, post_data)
            .then(r => r.ok ? r.json() : Promise.reject(r))
            .then(r => {
                const out = {
                    status: 'success',
                    data: response2data ? response2data(r) : r,
                };

                success && success(out);

                return out;
            })
            .catch(err => {
                const out = { status: 'error', error: err };

                error && error(out);

                return out;
            });
    }
    /** *************************************************************** *
     *  Terminate ?
     * **************************************************************** */
    makeGraphQLDataItem (v) {
        if ("string"===(typeof v))
            return JSON.stringify(v);

        if (Array.isArray(v))
            return '[' + v.map(d => this.makeGraphQLDataItem(d)).join(', ') + ']';

        return v;
    }
    makeGraphQLData (data) {
        const x = Object.keys(data).map(key => {
            const val = data[key];

            if (val===null
                || (Array.isArray(val) && val.length===0))
                return null;

            return key + ': ' + this.makeGraphQLDataItem(data[key]);
        });

        return '{ ' + x.filter(d=>d!==null).join(', ') + ' }';
    }
    /** *************************************************************** *
     *  Response
     * **************************************************************** */
    text2json (r) {
        return r.ok ? r.json() : Promise.reject(r);
    }
    json2response (r, getData) {
        if (r.errors)
            throw new Error(r.errors);

        return {
            type: 'success',
            data: getData(r),
        };
    }
    error2response (error) {
        return { type: 'error', data: error };
    }
}
