function validTableName(tableName) {
    if (!/^[\w_]+$/.test(tableName)) {
        throw new Error('table name `' + tableName + '` is invalid！');
    }
}

function execute(connection, options, values, cb) {
    values
        ? Array.isArray(values)
            ? connection.query(
                options.replace(/@p(\d+)/g, (m, key) => {
                    return connection.escape(values[key]);
                }),
                values,
                cb
            )
            : connection.query(
                options.replace(/\{([\w_]+)\}/g, (m, key) => {
                    return connection.escape(values[key]);
                }),
                values,
                cb
            )
        : connection.query(options, cb);
}

function query(connection, options, values, resolve, reject, autoRelease = true) {
    const cb = (error, results) => {
        autoRelease && connection.release();

        if (error) reject(error);
        else {
            // if (results) results.fields = fields;
            resolve(results);
        }
    };

    execute(connection, options, values, cb);
}

function insert(connection, tableName, values, resolve, reject, autoRelease) {
    const keys = Object.keys(values);
    const cols = [];
    const vals = [];

    keys.forEach((key, i) => {
        if (!key || !/^[\w_]+$/.test(key)) {
            throw new Error('column name `' + key + '` is invalid！');
        }
        cols.push(key);
        vals.push('@p' + i);
    });

    query(connection, 'insert into ' + tableName + '(' + cols.join(',') + ') values (' + vals.join(',') + ')', values, resolve, reject, autoRelease);
}

module.exports = {
    validTableName,
    execute,
    query,
    insert
};
