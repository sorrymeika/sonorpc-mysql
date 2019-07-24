const { query, validTableName, insert } = require('./util');

class Connection {
    constructor(conn) {
        this.conn = conn;
    }

    query(options, values) {
        return new Promise((resolve, reject) => {
            query(this.conn, options, values, resolve, reject, false);
        });
    }

    insert(tableName, values) {
        validTableName(tableName);

        return new Promise((resolve, reject) => {
            insert(this.conn, tableName, values, resolve, reject, false);
        });
    }

    release() {
        this.conn.release();
    }
}

module.exports = Connection;