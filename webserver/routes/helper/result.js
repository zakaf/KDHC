module.exports = {
    finishRequest: function (err, res, data) {
        let status = 'success';

        if (err) {
            console.error(err);
            status = 'error';
        }

        res.send({
            'status': status,
            'data': data
        });
    }
};