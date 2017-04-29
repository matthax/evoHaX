/**
 * GET /map
 * Map page.
 */
exports.getMap = (req, res) => {
    res.render('map', {
        title: 'Map'
    });
};
