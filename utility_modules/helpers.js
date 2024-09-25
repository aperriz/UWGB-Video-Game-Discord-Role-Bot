var client;

module.exports = {
    reloadCommand: function(c){
        
        if(client){
            command = client.commands.get(c);
            delete require.cache[require.resolve(`./${command.data.name}.js`)];

            try {
                const newCommand = require(`./${command.data.name}.js`);
                client.commands.set(newCommand.data.name, newCommand);
                
            } catch (error) {
                console.error(error);
                
            }
        }
        else{
            console.log("Client not set");
        }
    }
}