
export default {
  name: 'add-bot',
  isAddBotChannelOnly: true,
  usage: ['botId', 'prefix', 'shortDesc'],
  async execute(client, message, args) { 
    const [bot, prefix, shortDesc] = args
      
   const bots = client.db.collection('bots');

    const entry = await bots.findOne({ id: bot.id });

    if (entry?.approved) {
      await message.reply({ content: 'That bot is already approved.' });

      return;
    }

    if (entry !== null) {
      await message.reply({ content: 'That bot already exists in the queue.' });

      return;
    }

    await bots.insertOne({
      name: bot.username,
      avatarURL: bot.displayAvatarURL({ format: 'png' }),
      bot.id, // https://github.com/OpenBotlist/obl/issues/10
      prefix,
      shortDesc,
      approved: false,
      ownerID: message.author.id
    });

    await message.author
      .send('Your bot has been added to the queue!')
      .catch(() => undefined); // send it to DMs
    await message.delete().catch(() => undefined); // this should delete the command message (!add-bot)
  }
};
