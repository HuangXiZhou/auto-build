var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var spawn = require('child_process').spawn;
app.use(bodyParser.json());

app.post('/pushcode', function (req, res) {
  if(req.body.password == '123456' && req.body.hook_name == 'push_hooks' && req.body.ref == 'refs/heads/master'){
    rumCommand('sh', ['./auto_build.sh'], txt => {
      console.log(txt)
    })
  }
});

const rumCommand = (cmd, args, callback) => {
  const child = spawn(cmd, args)
  let response = ''
  child.stdout.on('data', buffer => response += buffer.toString())
  child.stdout.on('end', () => callback(response))
}


var server = app.listen(7777, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
