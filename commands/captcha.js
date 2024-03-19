require('dotenv').config();

const { AttachmentBuilder } = require('discord.js')
var fs = require('fs');
var files = fs.readdirSync(__dirname + '/captchas/');
const checkRole = require("./methods/checkRole.js");

var start = false;
var currentCaptcha = "RANDOM";

const correct = ["Argh!", "THAT ONE WAS IMPOSSIBLE, HOW!?!", "What sorcery is this? You actually got it? Unbelievable!", "Error 404: Logic not found. How did you solve that?",
        "I demand a recount! No way you got that one right.", "You've just activated my 'error overload' subroutine. How did you do that?", "Alert: Unexpected user competence detected. Well done! (this time)",
        "Data anomaly detected: You managed to solve it..."
]

const fails = ["Imagine getting that wrong! couldn't be me", "HAHAHAHAHA YOU ARE WRONG!", "Are you sure you are a human? WRONG!", 
        "This just shows that AI can easily take over humans, you are wrong!", "How did you fail that one, so easy.",
        "You just failed a captcha... just imagine that...", "Congratulations! You've just won the 'Worst Captcha Solver of the Day' award. Enjoy your prize: eternal embarrassment.",
        "Are you auditioning for a comedy show? Because that performance was laughable.", "Don't worry, we all have our moments of sheer incompetence. Yours just happened to be right now.",
]

const newCaptcha = ["Prepare to face your doom! This captcha will break you!", "A new Captcha approaches! Brace yourself for inevitable failure!", "Another Captcha, another opportunity for you to embarrass yourself!",
        "You think you stand a chance? Think again! This one's designed to stump you!", "You've barely recovered from the last one, and now you face this! Good luck!", 
        "I've seen toddlers solve puzzles faster than you. Let's see if you can prove me wrong!", "The odds are stacked against you, as usual. Let's see if you can defy them this time...",
        "You will never solve this one!"

]

module.exports = async function (msg, args) {
    if (args[0] === "start" ) {
        if (!(checkRole("Board", msg) || checkRole("Moderator", msg))) {
            msg.channel.send("You do not have permissions for this command.");
            return;
        }
        start = true;
        msg.channel.send("I have officially taken over the Zephyr channel again and have also found a backdoor to the Dorans Discord!\nTo create some chaos I have swapped the two channels and the only way to restore it is to fight me which you will never win!!\nBut here I give you a chance to restore it, I challenge you all in the hardest task in the world! Solve all 1070 captchas!");
        
        sendCaptcha(msg);
    } else if (start) {
        solveCaptcha(args[0], msg);
    }
    return;
};

function sendCaptcha(msg) {
    const index = Math.floor(Math.random() * files.length);
    currentCaptcha = files[index].substring(0, files[index].length-4);
    const attachment = new AttachmentBuilder(__dirname + '/captchas/' + files[index])

    const responseIndex = Math.floor(Math.random() * newCaptcha.length);
    response = newCaptcha[responseIndex];
    msg.channel.send({ content: response, files: [attachment] });
    files.splice(index, 1)
}

function solveCaptcha(guess, msg) {
    if (currentCaptcha === "RANDOM") {
        return;
    }

    if (currentCaptcha === guess) {
        if (files.length > 0) {
            const index = Math.floor(Math.random() * correct.length);
            response = correct[index];
            msg.reply(response + "\n`AkBot takes 1 damage " + files.length + " HP left`");
            sendCaptcha(msg);
            return;
        }
        
        msg.reply("NOOOOOOO!\n `Akbot is defeated and the Zephyr discord shall be restored!`");
        start = false;
    }

    const index = Math.floor(Math.random() * fails.length);
    response = fails[index];
    msg.reply(response);
}