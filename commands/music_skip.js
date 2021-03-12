const { MessageEmbed }             = require("discord.js");
const { filter } = require("lodash");

let used = false;
let number = 1;

module.exports = async (client, message, args) => {
  // console.log(args);

  // const guild = client.guilds.get('809996921137135627');
  const guild = client.guilds.resolveID('809996921137135627');
  // console.log(guild);

  const serverVoice = await client.channels.fetch('819665139686703154');
  
  if(message.author.id === args.id_bot) {
    if(message.embeds.length) {
      if (message.embeds[0].title === 'Now playing') {
        const members = serverVoice.members.filter(member => !member.user.bot); // obtener la cantidad de personas en el canal
        // console.log(members.size);
        console.log(message.embeds[0].description);

        if(!used) {
          used = true;
          const votesRequired = Math.ceil(members.size * .6);
          const embed = new MessageEmbed()
            .setDescription(`Se necesita: ${votesRequired} votos para dar skip`);
          const msg = await message.channel.send(embed);
          await msg.react('👍');

          const filter = reaction => reaction.emoji.name === '👍';

          try {
            const reactions = await msg.awaitReactions(filter, { max: votesRequired, time: 60000, errors: ['time'] });
            const totalVotes = reactions.get('👍').users.cache.filter(member => !member.bot);
            if (totalVotes.size >= votesRequired) {
              message.channel.send(`--next`);
              used = false;
            }
          } catch (err) {
            console.log('ingreso al error');
            console.log(err);
            used = false;
          }


          // try {
          //   const totalVotes = reactions.get('👍').users.cache.filter(member => !member.user.bot);
          //   if (totalVotes.size >= votesRequired) {
          //     message.channel.send(`--next`);
          //     used = false;
          //   }
          // } catch (err) {
          //   console.log(err);
          //   used = false;
          // }
        }

        // if(members.size === 1) {
        //   message.channel.send(`--next`);
        // } else {
        //   if(!used) {
        //     used = true;
        //     const votesRequired = Math.ceil(members.size * .6);
            
        //     const embed = new MessageEmbed()
        //       .setDescription(`Se necesita ${votesRequired} votos para dar skip`);
        //     const msg = await message.channel.send(embed);
        //     await msg.react('👍');
        //     await msg.react('👎');

        //     const filter = (reaction) => {
        //       return (reaction.emoji.name === '👍');
        //     };

        //     try {
        //       const reactions = await msg.awaitReactions(filter, {max: votesRequired, time: 1000, errors: ['time'] });
        //       const totalVotes = reactions.get('👍').user.cache.filter(member => !member.user.bot);
        //       if(totalVotes >= votesRequired) {
        //         message.channel.send(`--next`);
        //         used = false;
        //       }
        //     } catch (err) {
        //       console.log(err);
        //       used = false
        //     }

        //   }
        // }
      }
    }
  }
}
