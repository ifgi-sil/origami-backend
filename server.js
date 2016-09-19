var restify = require('restify');
var mongojs = require('mongojs');
var db = mongojs('origami', ['games']);
var fs = require('fs');
var multer = require('multer');
var md5file = require('md5-file')
var path = require('path')
var im = require('imagemagick')

var https_options = {
  key: fs.readFileSync('path_to_ssl_certificate_key'),
  certificate: fs.readFileSync('path_to_ssl_certificate')
}

var server = restify.createServer(https_options);

/* Solving CORS development pains */
server.use(
  restify.CORS({
    origins: [
      '*'
    ],
    headers: [
      "authorization",
      "withcredentials",
      "x-requested-with",
      "x-forwarded-for",
      "x-real-ip",
      "x-customheader",
      "user-agent",
      "keep-alive",
      "host",
      "accept",
      "connection",
      "upgrade",
      "content-type",
      "dnt",
      "if-modified-since",
      "cache-control"
    ],
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS']
  })
)

function corsHandler(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    //res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
    res.setHeader('Access-Control-Allow-Headers', 'Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-Requested-With, X-PINGOTHER, X-CSRF-Token, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Expose-Headers', 'X-Api-Version, X-Request-Id, X-Response-Time');
    res.setHeader('Access-Control-Max-Age', '1000');
    return next();
  }
// server.use();

// Handle all OPTIONS requests to a deadend (Allows CORS to work them out)
// server.opts( /.*/, ( req, res ) => res.send( 200 ) )
server.opts('/.*/', corsHandler, function(req, res, next) {
  res.send(200);
  return next();
});

/* End of CORS fixes */
/*
*/

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());

/* Server wide declaration was causing problems when POSTing images with multer.
  Moved it to be specific to certain routes
*/
//server.use(restify.bodyParser());


server.listen(5000, "127.0.0.1", function () {
  console.log("Mongodb REST interface server started. Will only listen to requests from localhost (use nginx etc. downstream)");
});

// Get only one certain game
server.get("/games/item/:name", function (req, res, next) {
  db.games.find({ "name": req.params.name }, function (err, games) {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8'
    });
    res.end(JSON.stringify(games));
  });
  return next();
});

//Get all the games
server.get("/games", function (req, res, next) {
  db.games.find(function (err, games) {
    res.writeHead(200, {
      'Content-Type': 'application/json;charset=utf-8'
    });
    res.end(JSON.stringify(games));
  });

  return next();
});

// Add new game to the list
server.post("/games/item", restify.bodyParser(), function (req, res, next) {
  var item = req.params;
  db.games.save(item, function (err, data) {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8'
    });
    res.end(JSON.stringify(data));
  });
  return next();
});

// Delete certain game
server.del("/games/item/:name", function (req, res, next) {
  console.log("DELETE request for GAME [" + req.params.name + "] from HOST [" + req.headers.host + "]");
  db.games.remove({ 'name': req.params.name }, function (err, data) {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8'
    });
    res.end(JSON.stringify(data));
  });
  return next();
});


/*server.del("games/item/:id", function (req, res, next) {
  db.games.remove({ 'name': req.params.name }, function (err, data) {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8'
    });
    res.end(JSON.stringify(data));
  });
  return next();
});*/

// Get only game metadata from the database - getting all games was shown to be slow
server.get("/games/metadata", function (req, res, next) {
  db.games.find({}, { name: 1, description: 1, timecompl: 1, difficulty: 1 }, function (err, data) {
    res.writeHead(200, {
      'Content-Type': 'application/json;charset=utf-8'
    });
    res.end(JSON.stringify(data));
  });
  return next();
});

// Get uploaded image stored in game object
server.get("/data/img/:filename", function (req, res, next) {
  var filename = req.params.filename;
  var imgdir = "data";
  var fullpath = imgdir + "/" + filename;

  fs.readFile(fullpath, function (err, file) {
    if (err) {
      console.log("Error when reading file - ", fullpath);
      res.writeHead(500);
      return res.end();
    }
    im.identify(fullpath, function (err, features) {
      if (err) throw err;
      mime_type = features['mime type'];
      res.writeHead(200, { 'Content-type': mime_type });
      res.write(file);
      res.end();
      return next();
    });
  });
});


// Preparations for image upload using multer
var upload = multer({ 
	dest : './data/',
  limits: {
    filesize: 3000000, 
    files:1
  }
}).single("imgfile");

/* 
  1. Upload image to directory specified by multer (temp filename auto-assigned by multer)
  2. Get image parameters (type, width, height, size) using Imagemagick (requires it to be pre-installed)
  3. Calculate MD5 checksum of uploaded file
  4. If file already exists delete the temp file
  5. If file does not exist, rename it in the  "<md5sum>.<filetype extension>" format

  TODO in future: Resize image if size or dimensions are too big
*/
server.post("/data/img/upload", upload, function(req, res, next) {
  var uploaded_file = res.req.file.path;

  function process_image(uploaded_file, format, width, height, filesize) {
    const ext_map = {'JPEG' : '.jpg', 'PNG' : '.png', 'GIF' : '.gif'};
    var uploaded_dir = path.dirname(uploaded_file)
    var basename = path.basename(uploaded_file)
    var md5sum = md5file.sync(uploaded_file);
    var new_file = uploaded_dir + path.sep + md5sum + ext_map[format];
    
    if (fs.existsSync(new_file)) {
      console.log('File "' + uploaded_file + '" is the same as "' + new_file + '". Removing the former.');
      fs.unlink(uploaded_file, function(err) {
        if (err) { console.log("Error occurred when removing file ", uploaded_file); }
      });
    } else {
      console.log("Renaming " + uploaded_file + " to " + new_file)
      fs.renameSync(uploaded_file, new_file)
    }
    res.contentType = 'json';
    res.send(200, {'img_file': path.basename(new_file)}).end();  
  }

  /* Get image params from ImageMagick */  
  im.identify( uploaded_file, function(err, features) {
    if (err) throw err;
    var format = features['format'];
    var width = features['width'];
    var height = features['height'];
    var size = features['filesize'];
    process_image(uploaded_file, format, width, height, size);
  });
  
  return next();
});

server.post("/games/player", restify.bodyParser(), function (req, res, next) {
  var item = req.params;
  var query = { _id: item.id };
  var playerInfo = item.playerInfo;
  db.games.update(query, {$push : {players : playerInfo}} , function (err, data) {
    if (err) throw err;
    console.log("Success ", data);
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8'
    });
    res.end(JSON.stringify(data));
  });
  return next();
});
