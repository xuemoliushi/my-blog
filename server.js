const http = require("http");
const fs = require("fs");
const path = require("path");

const POSTS_FILE=path.join(__dirname,"posts.json");
const COMMENTS_FILE=path.join(__dirname,"comments.json");

//统一发json响应
function sendJson(res,status,value){
    res.writeHead(status,{
        "Content-Type":"application/json;charset=utf-8",
        "Access-Control-Allow-Origin":"*"
    });
    res.end(JSON.stringify(value));
}

//读文件+解析JSON
function readJson(file,callback){//callback是一个调用时传入的函数
    fs.readFile(file,"utf8",function(err,data){
        if(err){
            callback(err);//先通知
            return;//再结束
        }
        try{
            callback(null,JSON.parse(data));
        }catch (e){
            callback(e);
        }
    });
}


const server = http.createServer(function (req,res){//req是由node自己解析出来的
    console.log(req.method,req.url);
    //跨源预检请求
    if(req.method==="OPTIONS"){
        res.writeHead(204,{
            "Access-Control-Allow-Origin":"*",
            "Access-Control-Allow-Methods":"GET,POST,OPTIONS",
            "Access-Control-Allow-Headers":"Content-Type"
        });
        res.end();
        return;
    }
    //GET/api/posts--文章列表
    if(req.url==="/api/posts"&&req.method==="GET"){
        readJson(POSTS_FILE,function(err,posts){
            if(err) return sendJson(res,500,{error:"读取文章失败"});
            sendJson(res,200,posts);
        });
        return;
    }
    //GET/api/comments--留言列表
    if(req.url==="/api/comments"&&req.method==="GET"){
        readJson(COMMENTS_FILE,function(err,comments){
            if(err) return sendJson(res,500,{error:"读取留言失败"});
            sendJson(res,200,comments);
        });
        return;
    }
    //POST/api/comments--新增留言
    if(req.url==="/api/comments"&&req.method==="POST"){
        let body="";
        req.on("data",function(chunk){//触发数据发来的时候就记录到body
            body+=chunk;
        });
        req.on("end",function(){//数据发完之后触发
            let input;
            try{
                input=JSON.parse(body);
            }catch(e){
                return sendJson(res,400,{error:"请求不合法 JSON"});
            }
            if(!input.text||!input.text.trim()){
                return sendJson(res,400,{error:"留言内容不能为空"});
            }

            readJson(COMMENTS_FILE,function(err,comments){
                if(err) return sendJson(res,500,{error:"读取留言失败"});
                const comment={
                    id: Date.now(),
                    text:input.text.trim(),
                    time: new Date().toISOString()
                };
                comments.push(comment);
                fs.writeFile(
                    COMMENTS_FILE,
                    JSON.stringify(comments,null,2),
                    "utf8",
                    function(err2){
                        if(err2) return sendJson(res,500,{error:"保存留言失败"});
                        sendJson(res,201,comment);
                    }
                );
            });
        });
        return;
    }
    res.writeHead(404,{"content-type":"text/plain;charset=utf-8"});
    res.end("404 Not Found");
});

server.listen(3000,function(){
    console.log("后端已启动：http://localhost:3000/api/posts");
});
