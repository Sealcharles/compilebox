
const dotenv = require("dotenv").config();
const _config = require('./config/config.js');
const restify = require('restify');
const fs = require('fs');
const shell = require('shelljs');
const https = require('https');
const path = require('path');
const unirest = require('unirest');
const Resp = require("./helpers/utilities");

const api_url = _config.api.app_base+_config.api._url+_config.api._version;

const server = restify.createServer({
    name: _config.api.app_name,
    version: _config.app_version
}); 
server.pre(restify.pre.sanitizePath());

/**
 * 
 * @param {*} res 
 * @param {*} data 
 * 
 * const resp = function(res,data){
    res.header("Access-Control-Allow-Origin", "*");
    res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
    res.end(JSON.stringify(data))
};
 */


server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser({mapParams: true}));
server.use(restify.plugins.bodyParser({mapParams: true}));


server.listen(_config.api._port, function () {
    console.log('%s listening at %s', server.name, server.url+api_url);
});


server.get(api_url+"/", function (req, res) {
    return res.send({msg:"Welcome to compilebox " + server.url+api_url});
})


/**
 * Hi please take a look at compilebox at github we are using it. but know we need second version modified for continius work. the system recieves info which container to start at which port and starts it and after some time when we are ready we send command for this container to be destroyed. 
Just will need to have permanent docker storage created with each container which will not be destroyed and later when referenced attached to working container. That way what was done will not be lost only the programs that created it in the container will be destroyed and initiated later.
We are starting many containers at the same time please advise can you modify the compilebox that way. 
Best Regards
 */


 /**
  * user_id: '22', the user id
language: 'mvc', - container name
mode_mvc: 'end', “start” or “end” means create a container with or destroy a container 
port_1: '1047', port1 is for communication with internal nodejs api from www to container
port_2: '30022', port 2 is web port to serve web page 
unique_id: '22_569 } the id of the container we reference that when we want to destroy it. And to reference the storage later.
mvc_ex_id: '569' specific to each exersize contains storage which should override the last layer of the application of the container lers say override all Laravel with this files.

We need some way to put files in this storages and to create them . you should say how.
  */

  /**
   * @param {*} user_id: User Id
   * @param {*} language:container_name
   * @param {*} mode_mv: Action needed a cpntainer to perform. e,g "start, storp or restart"
   * @param {*} port_1: docker container port
   * @param {*} port_2: host port
   * @param {*} unique_id: the id of the container we reference that when we want to destroy it. And to reference the                              storage later. this is the unique id of the container for general reference
   * @param {*} mvc_ex_id:i dont really underatand this
   */

  server.post(api_url+"/user_request", (req, res) => {
    
    var params = req.body;
    var user_id = params.user_id;
    var language = params.language;
    var mode_mvc = params.mode_mvc;
    var port_1 = params.port_1;
    var port_2 = params.port_2;
    var port_ssh = params.port_ssh;
    var port_mongo = params.port_mongo;
    var initial_code = params.initial_code;
    var right_answer = params.right_answer;
    var image_name = params.image_name;
    var ex_id = params.ex_id;
    var error = [];
    console.log('mode_mvc',mode_mvc);

    if (user_id == '') error.push("Please insert user id");
    if (language == '') error.push("Please insert container name");
    if (mode_mvc == '') error.push("Please insert mode_mvc");
    if (port_1 == '') error.push("Please insert port_w id");
    if (port_2 == '') error.push("Please insert port_api id");
    if (port_ssh == '') error.push("Please insert port_ssh id");
    if (port_mongo == '') error.push("Please insert port_mongo id");
    if (image_name == "")error.push("Please insert image name or set to default")

    if (req.body){
        if (error.length == 0){
            switch (mode_mvc) {
                case "start":
                    return res.send("Container Started " + shell.exec('docker start ' + language ));
                break;
                case "stop":
                    return res.send("Container Stopped " + shell.exec('docker stop ' + language ));
                break;
                case "restart":
                    return res.send("Restarted " + shell.exec('docker restart ' + language ));
                break;
                case "remove":
                    return res.send("Restarted " + shell.exec('docker rm ' + language ));
                break;
                case "run":
                    var image_name = params.image_name;
                    var volume_name = 'sandbox-react-'+user_id+'_'+ex_id;
                    var container_name = 'sandbox-react-'+user_id;
                    var volume_path = "volumes";
                    var publish = port_1+':'+port_2;
                    return res.send("Started Container with volume id" + shell.exec('docker run -d --name  '+ container_name +  ' -p ' + publish + ' --mount source='+volume_name + ',target='+volume_path  + ' ' +image_name));
                break;
                default:
                    return res.send("Unidentified mvc_mode");
                break;
            }
        }else
            return res.send(error)
    }else{
        return res.send("Input paramters not set");
    }
})

server.post(api_url+"/delete_container", (req, res) => {
    
    var params = req.body;
    var user_id = params.user_id;
    var language = params.language;
    var mode_mvc = params.mode_mvc;
    var port_w = params.port_w;
    var port_api = params.port_api;
    var port_ssh = params.port_ssh;
    var port_mongo = params.port_mongo;
    var initial_code = params.initial_code;
    var right_answer = params.right_answer;
    var ex_id = params.ex_id;
    var error = [];


    if (user_id.length == 0) error.push("Please insert user id");
    if (language.length == 0) error.push("Please insert container name");
    if (mode_mvc.length == 0) error.push("Please insert mode_mvc");
    if (port_w.length == 0) error.push("Please insert port_w id");
    if (port_api.length == 0) error.push("Please insert port_api id");
    if (port_ssh.length == 0) error.push("Please insert port_ssh id");
    if (port_mongo.length == 0) error.push("Please insert port_mongo id");

    if (error.length == 0){
        return res.send("Deleted " + shell.exec('docker rm ' + language ) + " Container with  volume id 6f17216c9b3a...");
    }else
        return res.send(error)
})

server.post(api_url+"/stop_container", (req, res) => {
    
    var params = req.body;
    var user_id = params.user_id;
    var language = params.language;
    var mode_mvc = params.mode_mvc;
    var port_w = params.port_w;
    var port_api = params.port_api;
    var port_ssh = params.port_ssh;
    var port_mongo = params.port_mongo;
    var initial_code = params.initial_code;
    var right_answer = params.right_answer;
    var ex_id = params.ex_id;
    var error = [];


    if (user_id.length == 0) error.push("Please insert user id");
    if (language.length == 0) error.push("Please insert container name");
    if (mode_mvc.length == 0) error.push("Please insert mode_mvc");
    if (port_w.length == 0) error.push("Please insert port_w id");
    if (port_api.length == 0) error.push("Please insert port_api id");
    if (port_ssh.length == 0) error.push("Please insert port_ssh id");
    if (port_mongo.length == 0) error.push("Please insert port_mongo id");

    if (error.length == 0){
        return res.send("Stopped " + shell.exec('docker stop ' + language ) + " Container with  volume id 0e5bec869e38...");
    }else
        return res.send(error)
})



server.post(api_url+"/start_container", (req, res) => {
    var params = req.body;
    var user_id = params.user_id;
    var language = params.language;
    var mode_mvc = params.mode_mvc;
    var port_w = params.port_w;
    var port_api = params.port_api;
    var port_ssh = params.port_ssh;
    var port_mongo = params.port_mongo;
    var initial_code = params.initial_code;
    var right_answer = params.right_answer;
    var ex_id = params.ex_id;
    var error = [];


    if (user_id.length == 0) error.push("Please insert user id");
    if (language.length == 0) error.push("Please insert container name");
    if (mode_mvc.length == 0) error.push("Please insert mode_mvc");
    if (port_w.length == 0) error.push("Please insert port_w id");
    if (port_api.length == 0) error.push("Please insert port_api id");
    if (port_ssh.length == 0) error.push("Please insert port_ssh id");
    if (port_mongo.length == 0) error.push("Please insert port_mongo id");
    // sudo docker run -d --name milenium-alpine-lamp --mount source=lamp-volume,target=/Users/adedayoakinpelu/Documents/compile-box milenium1/alpine-lamp
    if (error.length == 0){
        return res.send("Started " + shell.exec('docker start ' + language ) + " Container with volume id dfbc2d2f18cf...")
    }else
        return res.send(error)

})


server.post(api_url+"/run", (req, res) => {
    var params = req.body;
    var user_id = params.user_id;
    var image_name = params.image_name;
    var mode_mvc = params.mode_mvc;
    var port_w = params.port_w;
    var port_api = params.port_api;
    var port_ssh = params.port_ssh;
    var port_mongo = params.port_mongo;
    var initial_code = params.initial_code;
    var right_answer = params.right_answer;
    var ex_id = params.ex_id;
    var error = [];


    if (user_id.length == 0) error.push("Please insert user id");
    if (image_name.length == 0) error.push("Please insert container name");
    if (mode_mvc.length == 0) error.push("Please insert mode_mvc");
    if (port_w.length == 0) error.push("Please insert port_w id");
    if (port_api.length == 0) error.push("Please insert port_api id");
    if (port_ssh.length == 0) error.push("Please insert port_ssh id");
    if (port_mongo.length == 0) error.push("Please insert port_mongo id");
    // sudo docker run -d --name milenium-alpine-lamp --mount source=lamp-volume,target=/Users/adedayoakinpelu/Documents/compile-box milenium1/alpine-lamp
    if (error.length == 0){
        var volume_name = 'sandbox-react-'+user_id;
        var container_name = 'sandbox-react-'+user_id;
        var volume_path = "/Users/adedayoakinpelu/Documents/compile-box/volumes";
        var publish = port_w+':'+port_api;
        return res.send("Started Container with volume id" + shell.exec('docker run -d --name  -p '+ container_name + ' --mount source='+volume_name + ',target='+volume_path  + ' ' +image_name))
    }else
        return res.send(error)

})


server.post(api_url+"/restart_container", (req, res) => {
    var params = req.body;
    var user_id = params.user_id;
    var language = params.language;
    var mode_mvc = params.mode_mvc;
    var port_w = params.port_w;
    var port_api = params.port_api;
    var port_ssh = params.port_ssh;
    var port_mongo = params.port_mongo;
    var initial_code = params.initial_code;
    var right_answer = params.right_answer;
    var ex_id = params.ex_id;
    var error = [];


    if (user_id.length == 0) error.push("Please insert user id");
    if (language.length == 0) error.push("Please insert container name");
    if (mode_mvc.length == 0) error.push("Please insert mode_mvc");
    if (port_w.length == 0) error.push("Please insert port_w id");
    if (port_api.length == 0) error.push("Please insert port_api id");
    if (port_ssh.length == 0) error.push("Please insert port_ssh id");
    if (port_mongo.length == 0) error.push("Please insert port_mongo id");

    if (error.length == 0)
        return res.send("Restarted " + shell.exec('docker start ' + language ) + " Container with volume id  ...");
    else
        return res.send(error)

})

server.post(api_url+"/check_logs", (req, res) => {
    var params = req.body;
    var user_id = params.user_id;
    var language = params.language;
    var mode_mvc = params.mode_mvc;
    var port_w = params.port_w;
    var port_api = params.port_api;
    var port_ssh = params.port_ssh;
    var port_mongo = params.port_mongo;
    var initial_code = params.initial_code;
    var right_answer = params.right_answer;
    var ex_id = params.ex_id;
    var error = [];


    if (user_id.length == 0) error.push("Please insert user id");
    if (language.length == 0) error.push("Please insert container name");
    if (mode_mvc.length == 0) error.push("Please insert mode_mvc");
    if (port_w.length == 0) error.push("Please insert port_w id");
    if (port_api.length == 0) error.push("Please insert port_api id");
    if (port_ssh.length == 0) error.push("Please insert port_ssh id");
    if (port_mongo.length == 0) error.push("Please insert port_mongo id");

    if (error.length == 0)
        return res.send(shell.exec('docker logs ' + language ));
    else
        return res.send(error)

})



function _curl(_url, recordname, recordtype, recordttl, recordvalue){
    unirest.post(_url+"/set_record")
    .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
        // var _params = {record_name: recordname, record_type: recordtype, record_ttl: recordttl, record_value: recordvalue}
        .send({record_name: recordname, record_type: recordtype, record_ttl: recordttl, record_value: recordvalue})
            .end(function (response) {
                console.log(response.body)               
    }); 
}

// function rollback(req, res, next) {
//     var contents = fs.readFileSync('rollback.sh', 'utf8');
//     if (shell.exec(contents).code !== 0) {
//         shell.echo('Error: deployment failed');
//         shell.exit(1);
//     }
//     next();
// }




// server.get('/', function(req, res){
//     return res.send(Resp.success({msg: 'Autodeployment service'}));
// });
// server.post('/deploy', dodeploy);
// server.post('/rollback', rollback);

// server.get('/deploy', function(req, res){
//     shell.exec('sh deploy.sh ' + '_bucketname' + ' ' + '_objectname')

// })