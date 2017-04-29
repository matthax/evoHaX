/**
 * GET /map
 * Contact form page.
 */
exports.getContact = (req, res) => {
    res.render('map', {
        title: 'Map'
    });
};
