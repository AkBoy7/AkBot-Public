const fs = require('fs');

module.exports = function (array, path) {
    fs.writeFileSync(path, JSON.stringify(array));
}