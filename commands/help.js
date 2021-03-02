
module.exports = function (msg, args) {
    console.log("Help requested by " + msg.author.username);
    msg.channel.send("My current commands are: " +
            "```!ak {the prefix for AkBot}\n!ak pic {for a randon picture of Akam}\n!ak gif {search and send a gif}\n!ak predict {gives you an answer to your question}\n!ak detect add {add a word from the detection list (MOD ONLY)}\n!ak detect remove {remove a word from the detection list (MOD ONLY)}\n!ak ignore add {add someone to the ignore list (MOD ONLY)}\n!ak ignore remove {remove someone from the ignore list (MOD ONLY)}```");
};