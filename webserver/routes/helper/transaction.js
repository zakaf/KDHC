module.exports = {
    /**
     * Convenience wrapper for database connection in a transaction (referenced from https://gist.github.com/glenjamin/8924190)
     */
    runTransaction: function (pool, body, callback) {
        pool.getConnection(function (err, conn) {
            if (err) return callback(err);

            conn.beginTransaction(function (err) {
                if (err) return done(err);

                body(conn, function (err, res) {
                    // Commit or rollback transaction, then proxy callback
                    let args = arguments;

                    if (err) {
                        if (err === 'rollback') {
                            args[0] = err = null;
                        }
                        conn.rollback(function () {
                            done.apply(this, args)
                        });
                    } else {
                        conn.commit(function (err) {
                            args[0] = err;
                            done.apply(this, args)
                        })
                    }
                });

                function done() {
                    conn.release();
                    callback.apply(this, arguments);
                }
            });
        })
    }
};