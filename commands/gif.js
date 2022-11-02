//const fetch = require('node-fetch');
require('dotenv').config();

module.exports = async function (msg, args) {
    console.log("Gif requested by " + msg.author.username);
    // if (msg.channel.id != process.env.MEMES_CHANNEL_ID && msg.channel.id != "926634778529247272") {
    //     msg.channel.send('Please use <#' + process.env.MEMES_CHANNEL_ID + '> for this command.');
    //     return;
    // }

    if (args.length == 0) {
        msg.channel.send("Please state what gif search terms you want to use, for example: ```!gif funny meme```");
    } else {
        let keywords = args.join(" ");
        let url = `https://api.tenor.com/v1/search?q=${keywords}&key=${process.env.TENORKEY}&contentfilter=high`;
        let response = await fetch(url); //TODO: fetch could cause issues later
        let json = await response.json();
        const index = Math.floor(Math.random() * json.results.length);
        msg.channel.send(json.results[index].url);
    }
};
