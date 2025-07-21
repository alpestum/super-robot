import { Agent } from '../types';
import { AGENT_API_URL } from '../constants';

const CACHE_KEY = 'agentDataCache';
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

const mapApiDataToAgent = (item: any): Agent => {
  return {
    Name: item.Name,
    Role: item.Role,
    'Phone number': item['Phone number'],
    Email: item.Email,
    WhatsApp: item.WhatsApp,
    'Profile photo': item['Profile photo'],
  };
};

export const fetchAgents = async (forceRefresh: boolean = false): Promise<Agent[]> => {
  if (!forceRefresh) {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { timestamp, agents: cachedAgents } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_DURATION_MS && Array.isArray(cachedAgents)) {
          console.log(`Loading agents from cache. Cached at: ${new Date(timestamp).toLocaleString()}`);
          return cachedAgents;
        } else {
          localStorage.removeItem(CACHE_KEY); 
        }
      }
    } catch (e) {
      console.error('Error reading agent data from cache:', e);
      localStorage.removeItem(CACHE_KEY);
    }
  } else {
      localStorage.removeItem(CACHE_KEY);
      console.log('Agent cache cleared due to force refresh.');
  }

  try {
    console.log('Fetching agents from API...');
    const response = await fetch(AGENT_API_URL);
    if (!response.ok) {
      let errorBody = 'No additional error information from server.';
      try { errorBody = await response.text(); } catch (textError) { /* ignore */ }
      console.error(`Agent API request failed with status ${response.status} ${response.statusText}. Server response: ${errorBody.substring(0, 200)}`);
      throw new Error(`Agent API request failed: ${response.status} ${response.statusText}.`);
    }

    let rawData;
    try { rawData = await response.json(); } catch (jsonError) {
      console.error('Failed to parse Agent API response as JSON:', jsonError);
      throw new Error('Agent API returned non-JSON response.');
    }
    
    let agentsArray: any[] = [];
    if (Array.isArray(rawData)) agentsArray = rawData;
    else if (rawData && Array.isArray(rawData.data)) agentsArray = rawData.data;
    else if (typeof rawData === 'object' && rawData !== null) {
        for (const key in rawData) if (Array.isArray(rawData[key])) { agentsArray = rawData[key]; break; }
    }

    const agents = agentsArray.map(mapApiDataToAgent).filter(agent => agent.Name);
    
    if (agents.length === 0 && agentsArray.length > 0) {
        console.warn("Mapping API data resulted in zero valid agents. Check mapping logic. First raw item:", agentsArray[0]);
    }

    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), agents }));
      console.log('Agents cached successfully.');
    } catch (e) {
      console.error('Error saving agents to cache:', e);
    }
    
    return agents;

  } catch (error) {
    console.error('Error in fetchAgents:', error); 
    if (error instanceof Error) throw error;
    else throw new Error(String(error));
  }
};
