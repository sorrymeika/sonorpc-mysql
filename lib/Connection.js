const { query, validTableName, insert, update } = require('./util');

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

    update(tableName, values, where) {
        validTableName(tableName);

        return new Promise((resolve, reject) => {
            update(this.conn, tableName, values, where, resolve, reject, false);
        });
    }

    release() {
        this.conn.release();
    }
}

module.exports = Connection;