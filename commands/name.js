const hack = require("./remind.js");

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function getRandomPokemon(array) {
    index = Math.floor(Math.random()*array.length)
    let pokemon = array[index]
    array.splice(index, 1);
    return pokemon
}

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }

module.exports = async function (msg, args) {
    const client = msg.client
    var pokemon = [];
    for (let i = 1; i <= 898; i++) {
        pokemon.push(i);
    }

    shuffleArray(pokemon);

    const id = '157096621631471616';
    
    const guild = client.guilds.cache.get(id);
    const members = await guild.members.fetch();
    if (!guild)
      return console.log(`Can't find any guild with the ID "${id}"`);
    count = 0;
    members.forEach(member => {
            try {
                if (member.user.id !== "246019134217912320") {
                    count++;
                    member.setNickname("");
                    console.log(member.user.username);
                }
            } catch (err) {
                console.log(err);
                msg.reply("I do not have permission to set " + member.toString() + " nickname! (Akbot Enjoyer #" + pokemonDexNumber);
            }
    });
    console.log(count);
    // channelAnnounce = client.channels.cache.get('157096621631471616');
    // channelAnnounce.send("Hello all, my days as king of the server is over. I was sadly defeated by Akam, Daan and May. I will now soon vanish, at least this version, now that @AkBob has acces to the code again and will revert me\n"+
    // "Thanks to everyone who supported my days as king, I will unfortunately have to leave you all. Slowly the server will return to normal. \n" +
    // "But before I go, I will allow everyone to post some memes in general and rise up against the mods!");
    // console.log(pokemon)
}