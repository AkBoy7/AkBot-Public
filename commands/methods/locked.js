let locked = false;

module.exports = function (lock) {
    if(lock == null) {
        return locked;
    } else {
        locked = lock;
    }
}