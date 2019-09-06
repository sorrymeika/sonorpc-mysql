
const mysql = require('mysql');
const { query, validTableName, insert } = require('./util');
const Connection = require('./Connection');

class MySQL {
    constructor(config) {
        this.db = mysql.createPool({
            queryFormat: function (query, values) {
                if (!values) return query;

                let r = Array.isArray(values) ? /@p(\d+)/g : /\{([\w_]+)\}/g;
                let sql = '';
                let m;
                let start = 0;

                while (m = r.exec(query)) {
                    sql += query.slice(start, m.index);
                    start = m.index + m[0].length;
                    sql += this.escape(values[m[1]]);
                }

                return sql;
            },
            ...config
        });
    }

    escape(value, stringifyObjects, timeZone) {
        return this.db.escape(value, stringifyObjects, timeZone);
    }

    query(options, values) {
        return new Promise((resolve, reject) => {
            this.db.getConnection((err, connection) => {
                if (err) reject(err);
                else {
                    query(connection, options, values, resolve, reject);
                }
            });
        });
    }

    insert(tableName, values) {
        validTableName(tableName);
        return new Promise((resolve, reject) => {
            this.db.getConnection((err, connection) => {
                if (err) reject(err);
                else {
                    insert(connection, tableName, values, resolve, reject);
                }
            });
        });
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.db.getConnection((err, connection) => {
                if (err) reject(err);
                else resolve(new Connection(connection));
            });
        });
    }

    /**
     * 使用事务
     *
     * @param {Function} exec 执行方法
     *
     * @example
     * this.ctx.mysql.useTransaction(async (conn) => {
     *     await conn.query('select 1');
     *     await conn.query('insert into user (name) values (@p0)');
     * })
     * .catch(e => console.log(e));
     */
    useTransaction(exec) {
        return new Promise((resolve, reject) => {
            this.db.getConnection((err, connection) => {
                if (err) reject(err);
                else {
                    connection.beginTransaction(async (err) => {
                        if (err) {
                            connection.release();
                            reject(err);
                        } else {
                            try {
                                const result = await exec(new Connection(connection));
                                connection.commit((commitErr) => {
                                    if (err) {
                                        return connection.rollback(() => {
                                            connection.release();
                                            reject(commitErr);
                                        });
                                    }
                                    connection.release();
                                    resolve(result);
                                });
                            } catch (execErr) {
                                if (execErr) {
                                    return connection.rollback(function () {
                                        connection.release();
                                        reject(execErr);
                                    });
                                }
                            }
                        }
                    });
                }
            });
        });
    }
}

module.exports = MySQL;