
const { mkdir } = require("fs").promises;
const { createServer } = require("http");
const Path = require('path');
const fs = require("fs");
const methods = Object.create(null);

createServer((request, response) => {
  let handler = methods[request.method] || notAllowed;
  handler(request)
    .catch(error => {
      if (error.status != null) return error;
      return { body: String(error), status: 500 };
    })
    .then(({ body, status = 200, type = "text/plain" }) => {
      response.writeHead(status, { "Content-Type": type });
      if (body && body.pipe) body.pipe(response);
      else response.end(body);
    });
}).listen(8000)


async function notAllowed(request) {
  return {
    status: 405,
    body: `Method ${request.method} not allowed.`
  };
}
methods.MKCOL = async function (request) {
  console.log(request.url, request.method)
  let path = Path.parse(request.url).dir.slice(1)
  console.log({ path })
  let stats;
  console.log(path.dir)
  try {
    stats = await fs.existsSync(path);
    await mkdir(path);
    return { status: 204 };
  } catch (error) {
    console.error(error)
    if (error.code != "ENOENT") throw error;
  }
  if (stats.isDirectory()) return { status: 204 };
  else return { status: 400, body: "Not a directory" };
};

methods.DELETE = async function (request) {
  console.log(request.url, request.method)
  var parsed = Path.parse(request.url)
  let path = parsed.dir.slice(1) //for directory only
  console.log({ path })
  let stats;
  console.log(path.dir)
  try {
    stats = await fs.existsSync(path);
    console.log('deleting', path)
    await fs.rmdirSync(path, { recursive: true });
    return { status: 204 };
  } catch (error) {
    console.error(error)
    if (error.code != "ENOENT") throw error;
  }
  if (stats.isDirectory()) return { status: 204 };
  else return { status: 400, body: "Not a directory" };
};

methods.GET = async function (request, response) {
  if (request.url = "/") {
    console.log('HERE')
    var fileData = fs.readFileSync('editor.html')
    return { status: 200, body: fileData, type: "text/html" };;

  }

  console.log(request.url, request.method)
  let path = Path.parse(request.url).base
  console.log({ path })
  let stats;

  try {
    stats = await fs.existsSync(path);
    fs.writeFileSync(path, "hi mom")
    return { status: 204 };
  } catch (error) {
    console.error(error)
    if (error.code != "ENOENT") throw error;
  }
  if (stats.isDirectory()) return { status: 204 };
  else return { status: 400, body: "Not a directory" };
};