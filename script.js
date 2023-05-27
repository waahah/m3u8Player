$(document).ready(() => {
    let voice = 1;

    const player = function () {

        const promise = new Promise((resolve, reject) => {

            const dp = new DPlayer({
                container: document.getElementById("dplayer"),
                autoplay: true,
                theme: "#FADFA3",
                lang: navigator.language.toLowerCase(),
                screenshot: true,
                hotkey: true,
                mutex: true,
                live: false, //直播模式
                danmaku: true,
                apiBackend: {
                    read:  options => {
                        console.log("Pretend to connect WebSocket");
                        options.success([]);
                    },
                    send: options => {
                        console.log(
                            "Pretend to send danmaku via WebSocket",
                            options.data
                        );
                        options.success();
                    },
                },
                video: {
                    url: "https://hw-m-l.cztv.com/channels/lantian/channel012/1080p.m3u8", //"http://113.62.253.22/live.aishang.ctlcdn.com/00000110240316_1/encoder/0/playlist.m3u8?CONTENTID=00000110240316_1&AUTHINFO=FABqh274XDn8fkurD5614t%2B1RvYajgx%2Ba3PxUJe1SMO4OjrtFitM6ZQbSJEFffaD35hOAhZdTXOrK0W8QvBRom%2BXaXZYzB%2FQfYjeYzGgKhP%2Fdo%2BXpr4quVxlkA%2BubKvbU1XwJFRgrbX%2BnTs60JauQUrav8kLj%2FPH8LxkDFpzvkq75UfeY%2FVNDZygRZLw4j%2BXtwhj%2FIuXf1hJAU0X%2BheT7g%3D%3D&USERTOKEN=eHKuwve%2F35NVIR5qsO5XsuB0O2BhR0KR", 
                    type: "customHls",
                    customType: {
                        customHls:  (video, player) => {
                            const hls = new Hls();
                            // 监听Hls.Events.ERROR事件，
                            // DNS解析、下载超时，都会触发manifestLoadError错误
                            hls.on(Hls.Events.ERROR, (eventName, data) => {
                                // 埋点上报，可以追踪data.details
                                reject(new Error(`${eventName}错误:详情${data.details}`));
                            });
                            hls.loadSource(video.src);
                            hls.attachMedia(video);
                        },
                    },
                },
                contextmenu: [
                    {
                        text: '🌬️个人博客',
                        link: 'https://waahah.xyz/',
                    },
                    {
                        text: '🔇静音/🔊播放',
                        click: (player) => {
                            console.log(player.user.data.volume)
                            if(voice){
                                voice = 0;
                                dp.volume( percentage=0, nostorage=true, nonotice=false);
                            }else{
                                voice = 1;
                                dp.volume( percentage=1, nostorage=true, nonotice=false);
                            }
                        }
                    },
                    {
                        text: '⏹销毁播放器',
                        click: player => {
                            dp.notice(text = '即将销毁m3u8视频播放器~', time = 2000);
                            console.log(player);
                            setTimeout(() => dp.destroy() ,2000);
                        }
                    }
                ]
            });

            resolve(dp);
        })

        return promise;
    }

    const senddan = dp => {
        const danmu = new Object({
            text: "请尽情的发表评论吧(*´∇｀*)~",
            color: "#fc1944",
            type: "right",
            maximum: 3000,
            user: 'waahah'
        });
        dp.danmaku.draw(danmu);
    };

    //回调函数
    const changeUrl = (link, promise, senddan) => {
        promise.then(
            dp => {
                dp.switchVideo(
                    {
                        url: link,
                    })
                if (senddan != undefined && typeof senddan == 'function') {
                    senddan(dp);
                } else {
                    throw new Error(`第三个参数${senddan}不是函数`);
                }
            }
        ).catch(
            err => {
                console.log(err);
                toast(`错误:${err}`);
            }
        );
    }

    const getRequest = async () => {
        let url = window.location.search; //获取url中"?"符后的字串
        console.log(url);
        let theRequest = new Object();
        if (url.indexOf("?") != -1) {
            let str = url.substr(1);
            strs = str.split("&");
            for (let i = 0; i < strs.length; i++) {

                theRequest[strs[i].split("=")[0]] = decodeURI(strs[i].split("=")[1]);

            }
        }
        return theRequest;
    }

    const getUrl = async () => {
        let link = window.location.href;
        let url = link.split('?waahah=')[1];
        return url;
    }

    const check = url => {
        const erron = document.getElementById('erron')
        if (url == '') {
            erron.innerText = '链接不能为空！';
            toast("链接不能为空！");
            return false
        }
        if (url.lastIndexOf('.m3u') == -1) {
            erron.innerText = '请输入正确的m3u链接！';
            toast("请输入正确的m3u链接！");
            return false
        }
        console.log(url);
        return url;
    }

    (async function () {
        let search = window.location.search;
        if (search.indexOf('?waahah') == 0) {
            //console.log();
            let link = await getUrl();
            let url = check(link);
            if (url) {
                const promise = player();
                changeUrl(url, promise, senddan);
            }
        }
    }
    )()

    //闭包回调函数,块级作用域变量资源未释放
    const once = fun => {
        var tag = true;

        const utils = {
            callback_func: () => {
                if (tag) {
                    tag = false;
                    const promise = fun();
                    console.log(promise);
                    return promise;
                }
            }
        }
        window.utils = utils;
        return window.utils;
    }

    const add_modal = async () => {
        const htm = `
        <div class="am-modal am-modal-alert" tabindex="-1" id="my-alert">
        <div class="am-modal-dialog">
            <div class="am-modal-hd">注意</div>
                <div class="am-modal-bd">
                <span id='erron' class="h5"></span>
                </div>
                <div class="am-modal-footer">
                <span class="am-modal-btn">我已知悉</span>
                </div>
            </div>
        </div>`
        const node = document.createElement('div');
        node.innerHTML = htm;
        document.body.appendChild(node);
        return htm;
    }

    const toast = (msg, duration) => {
        duration = isNaN(duration) ? 3000 : duration;
        let toastDom = document.createElement('div');
        toastDom.innerHTML = msg;
        toastDom.style.cssText = 'padding:2px 15px;min-height: 36px;line-height: 36px;text-align: center;transform: translate(-50%);border-radius: 4px;color: rgb(255, 255, 255);position: fixed;top: 50%;left: 50%;z-index: 9999999;background: rgb(0, 0, 0);font-size: 16px;'
        document.body.appendChild(toastDom);
        setTimeout(function () {
            var d = 0.5;
            toastDom.style.webkitTransition = '-webkit-transform ' + d + 's ease-in, opacity ' + d + 's ease-in';
            toastDom.style.opacity = '0';
            setTimeout(() => { document.body.removeChild(toastDom) }, d * 1000);
        }, duration);
    }

    const btn = document.getElementById("doplayers");
    btn.addEventListener('click', event => {
        const link = document.getElementById("url").value;
        let url = check(link);
        if (url) {
            //回调函数
            const promise = once(player).callback_func();
            changeUrl(url, promise, senddan);
        }
        //event.preventDefault();
        //event.stopPropagation()
    })

    async function synctime() {
        const time = new Date();
        const startyear = '2023';
        const endyear = time.getFullYear();
        const copyright = document.querySelector("#copyright");
        copyright.innerHTML = `Copyright © ${startyear} - ${String(endyear)} <a href='https://github.com/waahah/m3u8Player' style="color:#007bff;">waahah</a> All Rights Reserved.`
    }

    /*
    then的第二个参数捕捉调用then方法之前的异常，而无法捕捉then方法中产生的异常，
    then方法之后接回调函数.catch()方法则可以捕捉调用then方法前后全程产生的异常
    */
    (async () => {
        await add_modal();
    })().then(
        async () => {
            await synctime();
        },
        err => {
            console.log(err);
            toast(err);
        }
    );

});
