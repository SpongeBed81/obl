module.exports = {
  async execute(client, message) {
    if (message.author.bot) return;
    if (message.channel.type === 'DM') return;
    if (
      message.channel.id === client.botoptions.add_bot &&
      !message.content.startsWith('!add-bot')
    )
      await message.delete();
    if (!message.content.toLowerCase().startsWith(client.botoptions.prefix))
      return;

    console.log('ok 1');

    const args = message.content
      .slice(client.botoptions.prefix.length)
      .split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);

    console.log('ok 2', command);

    if (!command) return;

    if (
      command.isTeamOnly &&
      !client.botoptions.team.includes(message.author.id)
    ) {
      await message.reply('You have to be in the team');
      return;
    }

    if (
      command.canOnlyExecutedByAshley &&
      !client.botoptions.ashley.includes(message.author.id)
    ) {
      await message.reply('Only THE GOD HERSELF can execute this command');
      return;
    }

    if (
      command.isBottumReviewerOnly &&
      !client.botoptions.bottumrev.includes(message.author.id)
    ) {
      await message.reply('You have to be a bottum reviewer bruh');
      return;
    }

    if (
      command.isAddBotChannelOnly &&
      message.channel.id != client.botoptions.add_bot
    ) {
      await message.reply(
        'oh god ur cringe use this command at <#966397896176058428> smh ppl these days'
      );
      return;
    }
   try {
      let newargs = [];
      let usageFailed = false;
      let usageFailedText = [];
      if(Array.isArray(command.usage)) {
        
        // USAGE SYSTEM BY DENNIS
        // INSPIRED BY DSharpPlus.CommandsNext
        // COPY THIS COMMENT TOO IF YOU WANT TO USE IT
        
        await Promise.all(command.usage.map(async (u, i) => {
          if(typeof(u) === "string") {
            let name = u;
            u = client.usages[u];
            if(!u.name) u.name = name;
          }
          u.type = (u.type || "text");
          let arg = args[i];
          
          if(u.rest === true) {
            newargs.push(args.slice(i).join(" "));
            return;
          }
          
          if(!u.optional) {
            if(!arg || arg.length == 0) {
              usageFailedText.push(u.message || `\`${capitalize(u.name)}\` is required!`);
              usageFailed = true;
              return;
            }
            
            if(u.type == "text") {
              if(u.max !== undefined
                && arg.length > u.max) {
                usageFailedText.push(u.message || `\`${capitalize(u.name)}\` cannot be longer than \`${u.max}\` characters!`);
                usageFailed = true;
                return;
              }
              
              newargs.push(arg);
            } else if(u.type == "number") {
              if(isNaN(Number(arg))) {
                usageFailedText.push(u.message || `\`${capitalize(u.name)}\` must be a number!`);
                usageFailed = true;
                return;
              }
              
              arg = Number(arg);
              
              if(u.max !== undefined
                && arg > u.max) {
                usageFailedText.push(u.message || `\`${capitalize(u.name)}\` cannot be larger than \`${u.max}\`!`);
                usageFailed = true;
                return;
              }
              
              newargs.push(arg);
            } else if(u.type == "user") {
              let uuser = await client.users.fetch(arg).catch(() => null);
              
              if(uuser === null) {
                usageFailedText.push(u.message || `\`${capitalize(u.name)}\`: ${u.bot ? "Bot" : "User"} not found!`);
                usageFailed = true;
                return;
              }
              
              if(u.bot && !uuser.bot) {
                usageFailedText.push(u.message || `\`${capitalize(u.name)}\`: **${uuser.username}** isnt a bot!`);
                usageFailed = true;
                return;
              }
              
              newargs.push(uuser);
            }
          }
        }));
        
      } else {
        newargs = args;
      }
      
      if(usageFailed) {
        let usageStrings = command.usage.map((u, idx) => {
          if(typeof(u) === "string") {
            let name = u;
            u = client.usages[u];
            if(!u.name) u.name = name;
          }
          
          let braceOpen = u.optional ? "[" : "<";
          let braceClose = u.optional ? "]" : ">";
          
          let uname = u.name || "arg" + idx;
          
          let utype = "";
          if(u.type !== undefined && u.type !== "text") utype = ": " + humanizeUsageType(u.type);
          
          return braceOpen + uname + utype + braceClose;
        });
        
        await message.reply(
          `**Usage:** \`${client.botoptions.prefix}${command.name} ${usageStrings.join(" ")}\`\n` +
          usageFailedText.map(x => ":x: " + x).join("\n"));
        return;
      }
      
      await command.execute(client, message, newargs);
    } catch (error) {
      await message.channel.send(
        `An error occured ...\n\`\`\`xl\n${error}\`\`\``
      );
    }
  }
};


const humanizeUsageType = (type) => {
  let dict = {
    user: "id",
  };
  
  return dict[type] || type;
}

const capitalize = (str) => {
  return str; // meh just dont
  // lmao
};