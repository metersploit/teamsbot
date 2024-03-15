const {
  TeamsActivityHandler,
  CardFactory,
  ActionTypes,
} = require('botbuilder');
const axios = require('axios');

class TeamsBot extends TeamsActivityHandler {
  constructor() {
    super();

    this.onMessage(async (context, next) => {
      const text = context.activity.text.trim();

      if (text.toLowerCase().startsWith('@blockbot')) {
        const ipAddress = text.substring('@blockbot'.length).trim();

        if (ipAddress) {
          // Call the API with the provided IP address
          const result = await this.callApi(ipAddress);

          //await context.sendActivity(`Blocking status for ${ipAddress}: ${result}`);
          
          if (!result) {
            await context.sendActivity(`NO BLOCKED EVENTS DETECTED FOR IP ${ipAddress}`);

          } else {
            await context.sendActivity(`BLOCKED EVENTS DETECTED FOR IP ${ipAddress}`)

          }
        } else {
          // No IP address provided
          await context.sendActivity('Please provide an IP address after @blockbot.');
        }
      }

      await next();
    });
  }

  async callApi(ipAddress) {
    const apiUrl = "http://10.10.83.100/api/search/direct";
    const apiToken = 'T3MKpySDTNtpYtCAEJvEK7jlwlr92tSLJnmRpGyTkJJXmw';
    const requestData = "";
    
    try {
      const response = await axios.post(apiUrl, requestData, {
        headers: {
          'Gravwell-Token': apiToken,
          'query': `tag=cisco-skinny,tipping_point_skinny ax dstPort != 53 | words ${ipAddress} | eval if (DATA ~ \"${ipAddress}\") { Notes = \"BLOCKED EVENTS DETECTED\"; set_data(Notes);} | limit 1`,
          'duration': '24h',
          'format': 'text'
        }
      });

      return response.data;

    } catch (error) {
      console.error('Error calling API:', error);
      return 'Unable to fetch data from API';
    }
  }
}

module.exports.TeamsBot = TeamsBot;