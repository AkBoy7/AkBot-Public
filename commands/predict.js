const possibleAnswers = [
    "As I see it, yes",
    "It is certain",
    "It is decidedly so",
    "Most likely",
    "Outlook good",
    "Signs point to yes",
    "Without a doubt",
    "Yes",
    "Yes - definitely",
    "You may rely on it",
    "Reply hazy, try again",
    "Ask again later",
    "Better not tell you now",
    "Concentrate and ask again",
    "Don't count on it",
    "My reply is no",
    "My sources say no",
    "Outlook not so good",
    "Very doubtful",
];

module.exports = function (msg, args) {
    console.log("Prediction requested by " + msg.author.username);
    
    if (args.length == 0) {
        msg.channel.send("Give me a question and I will give you answers! Example: ```!ak predict Is AkBot the best bot?```");
    } else {
        const index = Math.floor(Math.random() * possibleAnswers.length);
        msg.channel.send(possibleAnswers[index]);
    }
};
