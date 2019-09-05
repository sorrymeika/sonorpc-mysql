function validTableName(tableName) {
    if (!/^[\w_]+$/.test(tableName)) {
        throw new Error('table name `' + tableName + '` is invalid！');
    }
}

function execute(connection, sql, values, cb) {
    return connection.query(sql, values, cb);
}

function query(connection, sql, values, resolve, reject, autoRelease = true) {
    const cb = (error, results) => {
        autoRelease && connection.release();

        if (error) reject(error);
        else {
            // if (results) results.fields = fields;
            resolve(results);
        }
    };

    execute(connection, sql, values, cb);
}

function insert(connection, tableName, values, resolve, reject, autoRelease) {
    const keys = Object.keys(values);
    const cols = [];
    const params = [];
    const vals = [];

    keys.forEach((key, i) => {
        if (!key || !/^[\w_]+$/.test(key)) {
            throw new Error('column name `' + key + '` is invalid！');
        }
        cols.push(key);
        params.push('@p' + i);
        vals.push(values[key]);
    });

    query(connection, 'insert into ' + tableName + '(' + cols.join(',') + ') values (' + params.join(',') + ')', vals, resolve, reject, autoRelease);
}

module.exports = {
    validTableName,
    execute,
    query,
    insert
};
