// This script will create a category named "PROGRESS TRACKING 🔥"
// with 30 channels named day-1, day-2, etc.
// AND send a message with the actual date to each channel
import { config } from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';

config();

// Create an array of 30 day channels
const daystreakChannels = Array.from({ length: 30 }, (_, i) => `day-${i + 1}`);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

const BOT_TOKEN = 'MTM0Mzk5MjEyMTIxNTk0NjkwNA.GAz8jJ._zPDZMtAaklLGJXCB0u7wzV_n_LoWAoBZkHsoI'
const GUILD_ID = '1339872110712983562'  
const DELAY_MS = 1500;

// Generate date strings for each day
function generateDates(numberOfDays = 30) {
  const dates = [];
  const today = new Date();
  
  for (let i = 0; i < numberOfDays; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Format the date as a readable string (e.g., "February 25, 2025")
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = date.toLocaleDateString('en-US', options);
    
    dates.push(dateString);
  }
  
  return dates;
}

async function createMultipleChannels(guild, channelNames, categoryId = null, voice = false) {
  console.log(`Starting to create ${channelNames.length} ${voice ? 'voice' : 'text'} channels...`);
  const results = [];
  const dates = generateDates(channelNames.length);
  
  for (let i = 0; i < channelNames.length; i++) {
    const name = channelNames[i];
    const dateForChannel = dates[i];
    
    try {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
      
      const channelOptions = {
        name: name,
        type: voice ? 2 : 0, 
        reason: 'Bulk channel creation'
      };
      
      if (categoryId) {
        channelOptions.parent = categoryId;
      }
      
      const channel = await guild.channels.create(channelOptions);
      console.log(`Created ${voice ? 'voice' : 'text'} channel: ${name} (ID: ${channel.id})`);
      
      // Send a message with the date to the new channel
      try {
        await new Promise(resolve => setTimeout(resolve, 500)); // Short delay before sending message
        await channel.send(`📅 **This is the channel for: ${dateForChannel}**\nTrack your progress for this day here!`);
        console.log(`Sent date message to channel ${name}: ${dateForChannel}`);
      } catch (msgError) {
        console.error(`Failed to send message to channel ${name}: ${msgError.message}`);
      }
      
      results.push({ 
        name, 
        date: dateForChannel,
        type: voice ? 'voice' : 'text', 
        success: true, 
        id: channel.id 
      });
    } catch (error) {
      console.error(`Failed to create channel ${name}: ${error.message}`);
      results.push({ 
        name, 
        date: dateForChannel,
        type: voice ? 'voice' : 'text', 
        success: false, 
        error: error.message 
      });
      
      if (error.message.includes('rate limit')) {
        const extraWait = 5000;
        console.log(`Hit rate limit, waiting additional ${extraWait/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, extraWait));
      }
    }
  }
  
  return results;
}

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  
  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    if (!guild) {
      console.error(`Could not find guild with ID ${GUILD_ID}`);
      return;
    }
    
    console.log(`Working with guild: ${guild.name}`);

    const daystreaksCategory = await guild.channels.create({
      name: 'PROGRESS TRACKING 🔥',
      type: 4,
      reason: 'Daystreaks category creation'
    });
    console.log(`Created category: PROGRESS TRACKING 🔥 (ID: ${daystreaksCategory.id})`);

    console.log('Creating 30 day channels under the PROGRESS TRACKING category...');
    const daystreaksResults = await createMultipleChannels(guild, daystreakChannels, daystreaksCategory.id);
    
    console.log('\nDaystreaks Channel Results:');
    console.log(JSON.stringify(daystreaksResults, null, 2));
    
    console.log('\n=== SUMMARY ===');
    const totalChannels = daystreaksResults.length;
    const successfulChannels = daystreaksResults.filter(r => r.success).length;
    
    console.log(`Total categories created: 1`);
    console.log(`Total channels attempted: ${totalChannels}`);
    console.log(`Successfully created: ${successfulChannels} channels`);
    console.log(`Failed to create: ${totalChannels - successfulChannels} channels`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    setTimeout(() => {
      client.destroy();
      console.log('Disconnected from Discord. Process complete.');
      process.exit(0);
    }, 1000);
  }
});

// Error handling
client.on('error', console.error);

// Login to Discord
client.login(BOT_TOKEN).catch(console.error);