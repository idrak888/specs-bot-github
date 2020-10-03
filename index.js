const Discord = require("discord.js");
const bot = new Discord.Client();
const axios = require("axios");

const prefix = "-";

bot.on('ready', () => {
    console.log(`Bot ready`);
});

bot.on('message', msg => {
    let args = msg.content.substring(prefix.length).trim().split(" ");

    if (!msg.content.startsWith(prefix)) return;
    if (msg.author.bot) return;

    const _id = msg.author.username;

    switch(args[0]) {
        case "reg":
            if (args.length < 2) return msg.channel.send("No specs provided bruh. Please write it out in text, like this: Core i7-1160G7 16gb DDR4 2400MHz GIGABYTE GeForce RTX 2060");
            if (msg.attachments.array().length < 1) return msg.channel.send("No pic provided. Please attach an image of your build along with your specs.");

            let specs = args.slice(1).join(" ");
            let setup_pic = msg.attachments.array()[0].url;

            msg.react("🔥");
            msg.channel.send("Registering machine ⚙");
            axios.get(`https://employees-atlas-api.herokuapp.com/specs/${_id}`).then(doc => {
                if (doc.data.length == 0) {
                    axios.post("https://employees-atlas-api.herokuapp.com/register_spec", {
                        user_id: _id,
                        specs,
                        setup_pic
                    }).then(doc => {
                        msg.channel.send(`Your build has been registered, looks sick! Run "-specs ${msg.author.username}" to view it!`);
                    }).catch(e => {
                        msg.channel.send(e);
                    });
                } else {
                    axios.post(`https://employees-atlas-api.herokuapp.com/update_specs/${_id}`, {
                        specs,
                        setup_pic
                    }).then(doc => {
                        msg.channel.send(`Your build has been updated! Run "-specs ${msg.author.username}" to view it!`);
                    }).catch(e => {
                        msg.channel.send(e);
                    });
                }
            });
           
            break;
        case "specs":
            if (!args[1]) return msg.channel.send("No username provided bruh");

            msg.react("👍");
            msg.channel.send("Retrieving build 🔎");
            
            axios.get(`https://employees-atlas-api.herokuapp.com/specs/${_id}`)
            .then(doc => {
                msg.channel.send(doc.data[0].specs);
                const embed = new Discord.MessageEmbed()

                .setTitle(`${doc.data[0]._id}'s Machine`)
                .setImage(doc.data[0].setup_pic)
                .setDescription(doc.data[0].specs)
                .setColor("BLUE")
                .setThumbnail("https://i.pinimg.com/originals/b8/cd/6d/b8cd6d45a84bd74c9d480a3b25309261.png")
                
                msg.channel.send(embed);
            }).catch(e => {
                msg.channel.send("Build not found, make sure to register first!");
            });

            break;
    }
});

bot.login(process.env.TOKEN);