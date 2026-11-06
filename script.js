
        //绑定切换主题的按钮，以及看本地是否有记录过主题，有就换成对应颜色
        const button = document.getElementById("theme-button");
        
        if(localStorage.getItem("theme")==="pink"){
            document.body.classList.add("pink-theme");
            if(button){
                button.textContent = "现在是粉色";
            }  
        }
        if(button){
            button.addEventListener("click",function(){
            
            document.body.classList.toggle("pink-theme");

            if(document.body.classList.contains("pink-theme")){
                    button.textContent = "现在是粉色";
                localStorage.setItem("theme","pink");
            }else{
                localStorage.setItem("theme","default");
                    button.textContent = "切换颜色";
            }
            
        });
        }

        //渲染文章部分
        const list=document.querySelector(".notes");
        function renderPosts(items){
            if(!list) return;
            list.innerHTML="";
            items.forEach(function (post){
                const card=document.createElement("article");
                card.className="note";
                card.innerHTML=`
                    <h3>${post.title}</h3>
                    <p class="post-meta">${post.date} · ${post.tag}</p>
                    <p>${post.excerpt}</p>
                    <a class="read-more" href="${post.url}">阅读全文</a>
                `;
                list.appendChild(card);
            });
        }//当前页面有就去后端拿数据
        if(list){
            fetch("http://localhost:3000/api/posts")/*异步*/
            .then(function(response){/*等价于.then(r=>r.json())*/ 
                return response.json();
            })
            .then(function(posts){/*上一个then的返回值作为这个then的参数 */
                renderPosts(posts);
            })
            .catch(function(error){/*处理出现错误的时候 */
                console.error("加载文章失败：",error);
            })
        }
        
        const commentList = document.querySelector(".comment-list");
        function renderComments(items){//渲染评论
            if(!commentList) return;

            commentList.innerHTML = "";
            items.forEach(function(c){
                commentList.appendChild(createCommentItem(c));
            });
        }

        if(commentList){//从服务器那里读取评论
            fetch("http://localhost:3000/api/comments")
                .then(function(rep){
                    return rep.json();
                })
                .then(function(comments){
                    renderComments(comments);
                })
                .catch(function(error){
                    console.error("加载留言失败：",error);
                });
        }

        const commentForm = document.querySelector(".comment-form");
        const commentInput = document.querySelector(".comment-input");
        if(commentForm){
            commentForm.addEventListener("submit",function(event){
                event.preventDefault();//拦下提交的自动刷新
                
                const text = commentInput.value.trim();
                if(!text) return;
                fetch("http://localhost:3000/api/comments",{
                    method:"POST",
                    headers:{"Content-Type":"application/json"},
                    body:JSON.stringify({text:text})
                })
                    .then(function(rep){
                        return rep.json();
                    })
                    .then(function(comment){
                        commentInput.value = "";
                        commentList.appendChild(createCommentItem(comment));
                    })
                    .catch(function(err){
                        console.error("提交失败",err);
                    });
            });
        }
        function formatTime(iso){
            const d = new Date(iso);
            const pad = function(n){
                return n<10?"0"+n:String(n);
            };
            return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())+" "+pad(d.getHours())+":"+pad(d.getMinutes());
        }
        function createCommentItem(c){
            const li = document.createElement("li");
            const textSpan = document.createElement("span");
            textSpan.className = "comment-text";
            textSpan.textContent = c.text;
            const timeSpan = document.createElement("time");
            timeSpan.className = "comment-time";
            timeSpan.textContent = formatTime(c.time);
            li.appendChild(textSpan);
            li.appendChild(timeSpan);
            return li;
        }