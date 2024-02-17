const init = function (getStage) {
    const express = require('express');
    const app = express();
    app.use(express.json());
    app.get('/', (req, res) => {
        res.send(getStage());
    });
    app.listen(process.env.PORT || 3000, () => {
        console.log('Server is running on http://localhost:3000/');
    });
}

module.exports = { init };
