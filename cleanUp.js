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


const BOT_TOKEN = 'MTM0Mzk5MjEyMTIxNTk0NjkwNA.GAz8jJ._zPDZMtAaklLGJXCB0u7wzV_n_LoWAoBZkHsoI'
const GUILD_ID = '1339872110712983562'  
const CATEGORY_NAME = 'PROGRESS TRACKING 🔥'; 
const DELAY_MS = 1000;                 

// Function to delete all channels in a category
async function deleteChannelsInCategory(guild, categoryName) {
  console.log(`Looking for category: ${categoryName}`);
  
  // Find the category by name
  const category = guild.channels.cache.find(
    ch => ch.type === 4 && ch.name === categoryName
  );
  
  if (!category) {
    console.log(`Category "${categoryName}" not found!`);
    return { success: false, deleted: 0, errors: 0 };
  }
  
  console.log(`Found category "${categoryName}" (ID: ${category.id})`);
  console.log(`Starting to delete channels in this category...`);
  
  // Get all channels in this category
  const channelsToDelete = guild.channels.cache.filter(
    ch => ch.parentId === category.id
  );
  
  console.log(`Found ${channelsToDelete.size} channels to delete`);
  
  let deleted = 0;
  let errors = 0;
  
  // Delete each channel with a delay
  for (const [id, channel] of channelsToDelete) {
    try {
      console.log(`Deleting channel: ${channel.name}`);
      await channel.delete(`Bulk channel deletion`);
      console.log(`Successfully deleted channel: ${channel.name}`);
      deleted++;
      
      // Add delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    } catch (error) {
      console.error(`Failed to delete channel ${channel.name}: ${error.message}`);
      errors++;
      
      // If we hit a rate limit, wait longer
      if (error.message.includes('rate limit')) {
        const extraWait = 5000;
        console.log(`Hit rate limit, waiting additional ${extraWait/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, extraWait));
      }
    }
  }
  
  // Optionally delete the category itself
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
    
    // Delete all channels in the specified category
    const result = await deleteChannelsInCategory(guild, CATEGORY_NAME);
    
    // Print summary
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

// Error handling
client.on('error', console.error);

// Login to Discord
client.login(BOT_TOKEN).catch(console.error);