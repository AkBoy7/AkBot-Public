module.exports = function (role, msg) {
    return msg.member.roles.cache.find(r => r.name === role);
}