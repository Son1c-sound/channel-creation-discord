// This script will remove all channels within a specific category
import { config } from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';

config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});


const BOT_TOKEN = ''
const GUILD_ID = '1339872110712983562'  
const CATEGORY_NAME = 'PROGRESS TRACKING 🔥'; 
const DELAY_MS = 1000;                 

async function deleteChannelsInCategory(guild, categoryName) {
  console.log(`Looking for category: ${categoryName}`);
  
  const category = guild.channels.cache.find(
    ch => ch.type === 4 && ch.name === categoryName
  );
  
  if (!category) {
    console.log(`Category "${categoryName}" not found!`);
    return { success: false, deleted: 0, errors: 0 };
  }
  
  console.log(`Found category "${categoryName}" (ID: ${category.id})`);
  console.log(`Starting to delete channels in this category...`);
  
  const channelsToDelete = guild.channels.cache.filter(
    ch => ch.parentId === category.id
  );
  
  console.log(`Found ${channelsToDelete.size} channels to delete`);
  
  let deleted = 0;
  let errors = 0;
  
  for (const [id, channel] of channelsToDelete) {
    try {
      console.log(`Deleting channel: ${channel.name}`);
      await channel.delete(`Bulk channel deletion`);
      console.log(`Successfully deleted channel: ${channel.name}`);
      deleted++;
      
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    } catch (error) {
      console.error(`Failed to delete channel ${channel.name}: ${error.message}`);
      errors++;
      
      if (error.message.includes('rate limit')) {
        const extraWait = 5000;
        console.log(`Hit rate limit, waiting additional ${extraWait/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, extraWait));
      }
    }
  }
  
  try {
    console.log(`Deleting category: ${category.name}`);
    await category.delete(`Bulk category deletion`);
    console.log(`Successfully deleted category: ${category.name}`);
  } catch (error) {
    console.error(`Failed to delete category ${category.name}: ${error.message}`);
  }
  
  return { success: true, deleted, errors };
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
    
    const result = await deleteChannelsInCategory(guild, CATEGORY_NAME);
    
    console.log('\n=== SUMMARY ===');
    if (result.success) {
      console.log(`Successfully deleted: ${result.deleted} channels`);
      console.log(`Failed to delete: ${result.errors} channels`);
    } else {
      console.log(`Operation failed: Category "${CATEGORY_NAME}" not found`);
    }
    
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

client.on('error', console.error);

client.login(BOT_TOKEN).catch(console.error);
